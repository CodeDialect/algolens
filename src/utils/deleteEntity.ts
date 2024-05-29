import { PeraWalletConnect } from "@perawallet/connect";
import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";
import algosdk from "algosdk";
import { algodClient } from "./constants";

export const deleteEntity = async (
  accountAddress: string | null,
  appId: number | null,
  peraWallet: PeraWalletConnect
) => {
  let params = await algodClient.getTransactionParams().do();
  params.fee = algosdk.ALGORAND_MIN_TX_FEE;
  params.flatFee = true;
  if (accountAddress === null) {
    return {
      success: false,
      error: "Please connect your wallet",
    };
  }

  if (appId === null) {
    return {
      success: false,
      error: "Invalid Post ID",
    };
  }
  try {
    let delAppTxn = algosdk.makeApplicationDeleteTxnFromObject({
      from: accountAddress,
      appIndex: appId,
      suggestedParams: params,
    });

    const singleTransaction: SignerTransaction[] = [
      {
        txn: delAppTxn,
        signers: [accountAddress],
      },
    ];

    let signedDelAppTxn = await peraWallet.signTransaction([singleTransaction]);

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
    return {
      success: true,
      message: "Post deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to delete post",
    };
  }
};
