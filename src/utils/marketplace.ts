import algosdk from "algosdk";
import {
  algodClient,
  indexerClient,
  marketplaceNote,
  numGlobalBytes,
  numGlobalInts,
  numLocalBytes,
  numLocalInts,
} from "./constants";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../database/firebase";
import { base64ToUTF8String, utf8ToBase64String } from "./conversion";
import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";
import { PeraWalletConnect } from "@perawallet/connect";
global.Buffer = global.Buffer || require("buffer").Buffer;

const approvalProgramUrl = "../contracts/marketplace_approval.teal";
const clearProgramUrl = "../contracts/marketplace_clear.teal";

async function fetchFile(url: RequestInfo | URL) {
  const response = await fetch(url);
  const fileContent = await response.text();
  return fileContent;
}

const approvalProgram = async () => await fetchFile(approvalProgramUrl);
const clearProgram = async () => await fetchFile(clearProgramUrl);

class Product {
  name: any;
  image: any;
  description: any;
  price: any;
  sold: any;
  appId: any;
  owner: any;
  constructor(
    name: any,
    image: any,
    description: any,
    price: any,
    sold: any,
    appId: any,
    owner: any
  ) {
    this.name = name;
    this.image = image;
    this.description = description;
    this.price = price;
    this.sold = sold;
    this.appId = appId;
    this.owner = owner;
  }
}

const compileProgram = async (programSource: string | undefined) => {
  let encoder = new TextEncoder();
  let programBytes = encoder.encode(programSource);
  let compileResponse = await algodClient
    .compile(programBytes)
    .do()
    .catch((err) => {
      console.log(err);
    });
  return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
};

// CREATE PRODUCT: ApplicationCreateTxn
export const createProductAction = async (
  perawallet: PeraWalletConnect,
  senderAddress: any,
  product: {
    image: string;
    name: string | undefined;
    description: string | undefined;
    price: number | bigint;
  }
) => {
  console.log("Adding product...");

  if (product.image?.length > 30) {
    throw new Error("Image text is too long. Try a shorter url");
  }

  let params = await algodClient.getTransactionParams().do();
  params.fee = algosdk.ALGORAND_MIN_TX_FEE;
  params.flatFee = true;

  // Compile programs
  const compiledApprovalProgram = await compileProgram(await approvalProgram());
  const compiledClearProgram = await compileProgram(await clearProgram());

  // Build note to identify transaction later and required app args as Uint8Arrays
  let note = new TextEncoder().encode(marketplaceNote);
  let name = new TextEncoder().encode(product.name);
  let image = new TextEncoder().encode(product.image);
  let description = new TextEncoder().encode(product.description);
  let price = algosdk.encodeUint64(product.price);

  let appArgs = [name, image, description, price];

  let txn = algosdk.makeApplicationCreateTxnFromObject({
    from: senderAddress,
    suggestedParams: params,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    approvalProgram: compiledApprovalProgram,
    clearProgram: compiledClearProgram,
    numLocalInts: numLocalInts,
    numLocalByteSlices: numLocalBytes,
    numGlobalInts: numGlobalInts,
    numGlobalByteSlices: numGlobalBytes,
    note: note,
    appArgs: appArgs,
  });

  const singleTransaction: SignerTransaction[] = [
    {
      txn: txn,
      signers: [senderAddress],
    },
  ];

  let txId = txn.txID().toString();

  try {
    const signedTxn = await perawallet.signTransaction([singleTransaction]);
    console.log(signedTxn);
    await algodClient
      .sendRawTransaction(signedTxn[0])
      .do()
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log("Couldn't sign Opt-in txns", error);
  }
  console.log("Signed transaction with txID: %s", txId);

  // Wait for transaction to be confirmed
  let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

  // Get the completed Transaction
  console.log(
    "Transaction " +
      txId +
      " confirmed in round " +
      confirmedTxn["confirmed-round"]
  );

  // Get created application id and notify about completion
  let transactionResponse = await algodClient
    .pendingTransactionInformation(txId)
    .do();
  console.log("Transaction Response", transactionResponse);
  let appId = transactionResponse["application-index"];
  console.log("Created new app-id: ", appId);
  appIdDB(appId);
  return appId;
};

const appIdDB = async (appId: number) => {
  console.log("Adding appId to database...");
  try {
    const docRef = await addDoc(collection(db, "products"), {
      appId: appId.toString(),
    }).catch((err) => {
      console.log(err);
    });
    console.log("Document written with ID: ", docRef);
    return docRef;
  } catch (err) {
    console.error("Error adding document: ", err);
    return null;
  }
};

const fetchPost: () => Promise<any> = async () =>
  await getDocs(collection(db, "products"))
    .then((querySnapshot) => {
      const newData = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        appId: doc.data().appId,
      }));
      return newData;
    })
    .catch((err) => {
      console.log(err);
    });

let products: Product[] = [];

export const getProductsAction = async () => {
  try {
    const appIds = await fetchPost();
    console.log("Fetching products...");

    // Step 1: Get all transactions by notePrefix (+ minRound filter for performance)
    await Promise.all(
      appIds.map(async (item: any) => {
        console.log(item.appId);
        let transactionInfo = await indexerClient
          .lookupApplications(item.appId)
          .includeAll(true)
          .do();

        if (transactionInfo.application.deleted) {
          return null;
        }
        let globalState = transactionInfo.application.params["global-state"];

        // 2. Parse fields of response and return product
        let owner = transactionInfo.application.params.creator;
        let name = "";
        let image = "";
        let description = "";
        let price = 0;
        let sold = 0;

        const getField = (
          fieldName:
            | WithImplicitCoercion<string>
            | { [Symbol.toPrimitive](hint: "string"): string },
          globalState: any[]
        ) => {
          return globalState.find((state) => {
            return state.key === utf8ToBase64String(fieldName);
          });
        };

        if (getField("NAME", globalState) !== undefined) {
          let field = getField("NAME", globalState).value.bytes;
          name = base64ToUTF8String(field);
        }

        if (getField("IMAGE", globalState) !== undefined) {
          let field = getField("IMAGE", globalState).value.bytes;
          image = base64ToUTF8String(field);
        }

        if (getField("DESCRIPTION", globalState) !== undefined) {
          let field = getField("DESCRIPTION", globalState).value.bytes;
          description = base64ToUTF8String(field);
        }

        if (getField("PRICE", globalState) !== undefined) {
          price = getField("PRICE", globalState).value.uint;
        }

        if (getField("SOLD", globalState) !== undefined) {
          sold = getField("SOLD", globalState).value.uint;
        }

        let product = new Product(
          name,
          image,
          description,
          price,
          sold,
          transactionInfo.application.id,
          owner
        );

        products.push(product);
      })
    );
  } catch (err) {
    return null;
  } finally {
    console.log(products);
  }
};
