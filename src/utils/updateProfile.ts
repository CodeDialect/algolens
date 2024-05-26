import { PeraWalletConnect } from "@perawallet/connect";
import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";
import algosdk from "algosdk";
import { algodClient } from "./constants";

export const updateProfile = async (
  username: string,
  accountAddress: string | null,
  peraWallet: PeraWalletConnect,
  updatedPicture: string,
  appId: number
) => {
  let params = await algodClient.getTransactionParams().do();
  params.fee = algosdk.ALGORAND_MIN_TX_FEE;
  params.flatFee = true;
  const op = new TextEncoder().encode("update_picture");
  const user = new TextEncoder().encode(username);
  const profilePicture = new TextEncoder().encode(updatedPicture);
  console.log("username: " + username);
  try {
    const signTxn = algosdk.makeApplicationCallTxnFromObject({
      from: accountAddress ? accountAddress : "",
      appIndex: appId,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      suggestedParams: params,
      appArgs: [op, user, profilePicture],
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
    await algodClient.sendRawTransaction(signedTxn.map((txn) => txn)).do();

    // Wait for transaction to be confirmed
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

    // Notify about completion
    console.log(
      "Transaction " +
        txId +
        " confirmed in round " +
        confirmedTxn["confirmed-round"]
    );

    return {
      success: true,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      error: err,
    };
  }
};
