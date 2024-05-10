// import algosdk from "algosdk";
// import {
//   algodClient,
//   indexerClient,
//   marketplaceNote,
//   numGlobalBytes,
//   numGlobalInts,
//   numLocalBytes,
//   numLocalInts,
// } from "./constants";
// import { collection, addDoc, getDocs } from "firebase/firestore";
// import { db } from "../database/firebase";
// import { base64ToUTF8String, utf8ToBase64String } from "./conversion";
// import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";
// import { PeraWalletConnect } from "@perawallet/connect";
// global.Buffer = global.Buffer || require("buffer").Buffer;

// export const buyProductAction = async (senderAddress: any, product: { appId: any; owner: any; price: number; }, count: number) => {
//     console.log("Buying product...");

//     let params = await algodClient.getTransactionParams().do();
//     params.fee = algosdk.ALGORAND_MIN_TX_FEE;
//     params.flatFee = true;

//     // Build required app args as Uint8Array
//     let buyArg = new TextEncoder().encode("signup");
//     let countArg = algosdk.encodeUint64(count);
//     let appArgs = [buyArg, countArg]

//     // Create ApplicationCallTxn
//     let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
//         from: senderAddress,
//         appIndex: product.appId,
//         onComplete: algosdk.OnApplicationComplete.NoOpOC,
//         suggestedParams: params,
//         appArgs: appArgs
//     })

//     // Create PaymentTxn
//     let paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
//         from: senderAddress,
//         to: algosdk.getApplicationAddress.toString(),
//         amount: product.price * count,
//         suggestedParams: params
//     })

//     let txnArray = [appCallTxn, paymentTxn]

//     // Create group transaction out of previously build transactions
//     let groupID = algosdk.computeGroupID(txnArray)
//     for (let i = 0; i < 2; i++) txnArray[i].group = groupID;

//     // Sign & submit the group transaction
//     let signedTxn = await perawallet.signTransaction(txnArray.map(txn => txn.toByte()));
//     console.log("Signed group transaction");
//     let tx = await algodClient.sendRawTransaction(signedTxn.map(txn => txn.blob)).do();

//     // Wait for group transaction to be confirmed
//     let confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);

//     // Notify about completion
//     console.log("Group transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
// }

export default {};