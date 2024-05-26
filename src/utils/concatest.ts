import { PeraWalletConnect } from "@perawallet/connect";
import { algodClient, indexerClient } from "./constants";
import algosdk from "algosdk";
import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";

export const ConcatTest = async (
  accountAddress: string | null,
  peraWallet: PeraWalletConnect
) => {
  let params = await algodClient.getTransactionParams().do();
  params.fee = algosdk.ALGORAND_MIN_TX_FEE;
  params.flatFee = true;

  let appArgs = [
    new TextEncoder().encode("unlike_post"),
    new TextEncoder().encode('12345'),
  ];
  try {
    const signTxn = algosdk.makeApplicationCallTxnFromObject({
      from: accountAddress ? accountAddress : "",
      appIndex: 668190604,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      suggestedParams: params,
      appArgs: appArgs,
    });

    const singleTransaction: SignerTransaction[] = [
      {
        txn: signTxn,
        signers: [accountAddress ? accountAddress : ""],
      },
    ];

    let txId = signTxn.txID().toString();

    const signedTxn = await peraWallet.signTransaction([singleTransaction]);
    console.log(signedTxn);
    await algodClient.sendRawTransaction(signedTxn[0]).do();
    console.log("Transaction ID: " + txId);
  } catch (err) {
    console.log(err);
  }
};
