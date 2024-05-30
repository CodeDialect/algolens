import { PeraWalletConnect } from "@perawallet/connect";
import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";
import algosdk from "algosdk";
import { algodClient, userNote } from "./constants";
import { fetchAppUser } from "./fetchData";

export const updateProfile = async (
  username: string,
  accountAddress: string | null,
  peraWallet: PeraWalletConnect,
  updatedPicture: string
) => {
  let params = await algodClient.getTransactionParams().do();
  params.fee = algosdk.ALGORAND_MIN_TX_FEE;
  params.flatFee = true;
  try {
    if (accountAddress === null) {
      return {
        success: false,
        error: "Please connect your wallet",
      };
    }

    const user = await fetchAppUser(accountAddress, userNote);

    if (user === null) {
      return {
        success: false,
        error: "User not found",
      };
    }
    
    if (user.appId === undefined || user.appId === null) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const appId = user.appId;

    if (user.userData === undefined || user.userData === null) {
      return {
        success: false,
        error: "User not found",
      };
    }

    if(user.userData[0].username !== username) {
      return {
        success: false,
        error: "Logged user is different",
      };
    }

    if (user.userData[0].loginStatus === 0) {
      return {
        success: false,
        error: "User not logged in",
      };
    }

    const op = new TextEncoder().encode("update_picture");
    const currentUser = new TextEncoder().encode(user.userData[0].username);
    const profilePicture = new TextEncoder().encode(updatedPicture);

    const signTxn = algosdk.makeApplicationCallTxnFromObject({
      from: accountAddress ? accountAddress : "",
      appIndex: appId,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      suggestedParams: params,
      appArgs: [op, currentUser, profilePicture],
    });

    const singleTransaction: SignerTransaction[] = [
      {
        txn: signTxn,
        signers: [accountAddress ? accountAddress : ""],
      },
    ];

    let txId = signTxn.txID().toString();

    const signedTxn = await peraWallet.signTransaction([singleTransaction]);
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
