import algosdk from "algosdk";
import {
  algodClient,
  indexerClient,
  // marketplaceNote,
  numGlobalBytes,
  numGlobalInts,
  numLocalBytes,
  numLocalInts,
} from "./constants";
import { collection, addDoc, getDocs } from "firebase/firestore";
// import { db } from "../database/firebase";
import { base64ToUTF8String, utf8ToBase64String } from "./conversion";
import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";
import { PeraWalletConnect } from "@perawallet/connect";
import { sign } from "crypto";
global.Buffer = global.Buffer || require("buffer").Buffer;

const approvalProgramUrl = "../newContracts/marketplace_approval.teal";
const clearProgramUrl = "../newContracts/marketplace_clear.teal";

async function fetchFile(url: RequestInfo | URL) {
  const response = await fetch(url);
  const fileContent = await response.text();
  return fileContent;
}


const approvalProgram = async () => await fetchFile(approvalProgramUrl);
const clearProgram = async () => await fetchFile(clearProgramUrl);

class Product {
  username: any;
  constructor(username: any) {
    this.username = username;
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
    username: string | undefined;
  }
) => {
//   console.log("Adding product...");

//   let params = await algodClient.getTransactionParams().do();
//   params.fee = algosdk.ALGORAND_MIN_TX_FEE;
//   params.flatFee = true;

//   // Compile programs
//   const compiledApprovalProgram = await compileProgram(await approvalProgram());
//   const compiledClearProgram = await compileProgram(await clearProgram());

//   // Build note to identify transaction later and required app args as Uint8Arrays
//   let userName = new TextEncoder().encode("sunny");
//   let signup = new TextEncoder().encode("signup");

//   let appUser = [signup, userName];
//   let txn = algosdk.makeApplicationCreateTxnFromObject({
//     from: senderAddress,
//     suggestedParams: params,
//     onComplete: algosdk.OnApplicationComplete.NoOpOC,
//     approvalProgram: compiledApprovalProgram,
//     clearProgram: compiledClearProgram,
//     numLocalInts: numLocalInts,
//     numLocalByteSlices: numLocalBytes,
//     numGlobalInts: numGlobalInts,
//     numGlobalByteSlices: numGlobalBytes,
//     appArgs: [userName],
//   });

//   const singleTransaction: SignerTransaction[] = [
//     {
//       txn: txn,
//       signers: [senderAddress],
//     },
//   ];

//   let txId = txn.txID().toString();

//   try {
//     const signedTxn = await perawallet.signTransaction([singleTransaction]);
//     console.log(signedTxn);
//     await algodClient
//       .sendRawTransaction(signedTxn[0])
//       .do()
//       .catch((err) => {
//         console.log(err);
//       });
//   } catch (error) {
//     console.log("Couldn't sign Opt-in txns", error);
//   }
//   console.log("Signed transaction with txID: %s", txId);

//   // Wait for transaction to be confirmed
//   let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

//   // Get the completed Transaction
//   console.log(
//     "Transaction " +
//       txId +
//       " confirmed in round " +
//       confirmedTxn["confirmed-round"]
//   );

//   // Get created application id and notify about completion
//   let transactionResponse = await algodClient
//     .pendingTransactionInformation(txId)
//     .do();
//   console.log("Transaction Response", transactionResponse);
//   let appId = transactionResponse["application-index"];
//   let price = transactionResponse["global-state-delta"][1]["value"].uint;
  
//   console.log(transactionResponse);
//   console.log("Price: ", price);
//   console.log("Created new app-id: ", appId);
//   console.log(algosdk.getApplicationAddress(appId));
//   let signin =  new TextEncoder().encode("login");
//   // Create ApplicationCallTxn
//   let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
//     from: senderAddress,
//     appIndex: appId,
//     onComplete: algosdk.OnApplicationComplete.NoOpOC,
//     suggestedParams: params,
//     appArgs: appUser,
//   });

//   let signTxn = algosdk.makeApplicationCallTxnFromObject({
//     appIndex: 0,
//     from: senderAddress,
//     onComplete: algosdk.OnApplicationComplete.NoOpOC,
//     suggestedParams: params,
//     appArgs: [signin],
//   });

  
//   let paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
//     from: senderAddress,
//     to: "XUQSPD6WYBX5I672T2L2YERGPXAMQCUQ6FQGHZ4ZZ7VTQF6M5TWJBQYQKY",
//     amount: price,
//     suggestedParams: params,
//   });

//   console.log(paymentTxn);

//   algosdk.assignGroupID([appCallTxn, paymentTxn]);

//   const multipleTxnGroups: SignerTransaction[] = [
//     { txn: appCallTxn, signers: [senderAddress]},
//     { txn: paymentTxn, signers: [senderAddress]},
//   ];
  
  
//   let signedTxn = await perawallet.signTransaction([multipleTxnGroups]);
//   console.log("Signed group transaction");
//   console.log(signedTxn);
//   let tx = await algodClient
//     .sendRawTransaction(signedTxn)
//     .do();
//   console.log(
//     "Transaction " +
//       tx +
//       " confirmed in round " +
//       confirmedTxn["confirmed-round"]
//   );
  
//   console.log("Transaction: ", tx);
//   appIdDB(appId);
//   return appId;
// };


// export const signIn = async (username: string, senderAddress: any, perawallet: any) => {
  
//   let signin =  new TextEncoder().encode("login");
//   let userName = new TextEncoder().encode(username);
//   let params = await algodClient.getTransactionParams().do();
//   params.fee = algosdk.ALGORAND_MIN_TX_FEE;
//   params.flatFee = true;

//   let signTxn = algosdk.makeApplicationCallTxnFromObject({
//     appIndex: 0,
//     from: senderAddress,
//     onComplete: algosdk.OnApplicationComplete.NoOpOC,
//     suggestedParams: params,
//     appArgs: [signin, userName],
//   });


//   const singleTransaction: SignerTransaction[] = [
//     {
//       txn: signTxn,
//       signers: [senderAddress],
//     },
//   ];

//   let txId = signTxn.txID().toString();

//   try {
//     const signedTxn = await perawallet.signTransaction([singleTransaction]);
//     console.log(signedTxn);
//     await algodClient
//       .sendRawTransaction(signedTxn[0])
//       .do()
//       .catch((err) => {
//         console.log(err);
//       });
//   } catch (error) {
//     console.log("Couldn't sign Opt-in txns", error);
//   }
//   console.log("Signed transaction with txID: %s", txId);

//   // Wait for transaction to be confirmed
//   let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

//   // Get the completed Transaction
//   console.log(
//     "Transaction " +
//       txId +
//       " confirmed in round " +
//       confirmedTxn["confirmed-round"]
//   );


// }

// const appIdDB = async (appId: number) => {
//   console.log("Adding appId to database...");
//   try {
//     const docRef = await addDoc(collection(db, "products"), {
//       appId: appId.toString(),
//     }).catch((err) => {
//       console.log(err);
//     });
//     console.log("Document written with ID: ", docRef);
//     return docRef;
//   } catch (err) {
//     console.error("Error adding document: ", err);
//     return null;
//   }
};
