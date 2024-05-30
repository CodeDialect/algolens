import algosdk from "algosdk";
import {
  algodClient,
  numGlobalBytes,
  numGlobalInts,
  numLocalBytes,
  numLocalInts,
  userNote,
} from "./constants";
import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";
import { PeraWalletConnect } from "@perawallet/connect";
import { fetchAppUser } from "./fetchData";

global.Buffer = global.Buffer || require("buffer").Buffer;

const approvalProgramUrl = "../newContracts/user/marketplace_approval.teal";
const clearProgramUrl = "../newContracts/user/marketplace_clear.teal";

async function fetchFile(url: RequestInfo | URL) {
  const response = await fetch(url);
  const fileContent = await response.text();
  return fileContent;
}

const approvalProgram = async () => await fetchFile(approvalProgramUrl);
const clearProgram = async () => await fetchFile(clearProgramUrl);

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

export const createUser = async (
  perawallet: PeraWalletConnect,
  senderAddress: any,
  User: {
    username: string | undefined;
  }
) => {
  let params = await algodClient.getTransactionParams().do();
  params.fee = algosdk.ALGORAND_MIN_TX_FEE;
  params.flatFee = true;

  // Compile programs
  const compiledApprovalProgram = await compileProgram(await approvalProgram());
  const compiledClearProgram = await compileProgram(await clearProgram());

  // Build note to identify transaction later and required app args as Uint8Arrays
  const userName = new TextEncoder().encode(User.username);
  const signup = new TextEncoder().encode("signup");
  const price = algosdk.encodeUint64(100000);
  let appUserArgs = [signup, userName];

  console.log(new TextDecoder().decode(new Uint8Array(price)));
  // console.log(new TextDecoder().decode(price));
  const user = await fetchAppUser(senderAddress, userNote);

  if (user?.userData !== null) {
    console.log(user);
    return "A Username already exists! with this address";
  }

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
    note: userNote,
    appArgs: [userName, price],
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

  let appId = transactionResponse["application-index"];

  // Create ApplicationCallTxn
  let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
    from: senderAddress,
    appIndex: appId,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    suggestedParams: params,
    appArgs: appUserArgs,
  });

  let paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: senderAddress,
    to: "XUQSPD6WYBX5I672T2L2YERGPXAMQCUQ6FQGHZ4ZZ7VTQF6M5TWJBQYQKY",
    amount: 100000,
    suggestedParams: params,
  });

  algosdk.assignGroupID([appCallTxn, paymentTxn]);

  const multipleTxnGroups: SignerTransaction[] = [
    { txn: appCallTxn, signers: [senderAddress] },
    { txn: paymentTxn, signers: [senderAddress] },
  ];

  let signedTxn = await perawallet.signTransaction([multipleTxnGroups]);

  let tx = await algodClient
    .sendRawTransaction(signedTxn)
    .do()
    .catch(async () => {
      let delAppTxn = algosdk.makeApplicationDeleteTxnFromObject({
        from: senderAddress,
        appIndex: appId,
        suggestedParams: params,
      });

      const singleTransaction: SignerTransaction[] = [
        {
          txn: delAppTxn,
          signers: [senderAddress],
        },
      ];

      let signedDelAppTxn = await perawallet.signTransaction([
        singleTransaction,
      ]);

      let delAppTx = await algodClient
        .sendRawTransaction(signedDelAppTxn[0])
        .do();
      let confirmedDelAppTxn = await algosdk.waitForConfirmation(
        algodClient,
        delAppTx.txId,
        4
      );

      console.log(
        "Transaction " +
          delAppTx.txId +
          " confirmed in round " +
          confirmedDelAppTxn["confirmed-round"]
      );
    });
  return "User created successfully with txID: " + tx.txId;
};
