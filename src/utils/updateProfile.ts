import { PeraWalletConnect } from "@perawallet/connect";
import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";
import algosdk from "algosdk";
import { algodClient } from "./constants";

export const updateProfile = async (
    username: string,
    accountAddress: string | null,
    peraWallet: PeraWalletConnect
) => {
    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;
    const op = new TextEncoder().encode("update_picture");
    const user = new TextEncoder().encode(username);
    const  profilePicture = new TextEncoder().encode("https://firebasestorage.googleapis.com/v0/b/algorand-d4a48.appspot.com/o/12345678910?alt=media&token=639b32c3-95b4-422a-a370-a75e54db7d07");
     console.log("username: " + username);                                                                                                                           
    try {
        const signTxn = algosdk.makeApplicationCallTxnFromObject({
            from: accountAddress? accountAddress : "",
            appIndex: 670798870,
            onComplete: algosdk.OnApplicationComplete.NoOpOC,
            suggestedParams: params,
            appArgs: [op, user, profilePicture],
        });

        const singleTransaction: SignerTransaction[] = [
            {
                txn: signTxn,
                signers: [accountAddress? accountAddress : ""],
            },
        ];

        let txId = signTxn.txID().toString();

        const signedTxn = await peraWallet.signTransaction([singleTransaction]);
        console.log(signedTxn);
        await algodClient.sendRawTransaction(signedTxn.map(txn => txn)).do();

        // Wait for transaction to be confirmed
        let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
        
        // Notify about completion
        console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    } catch (err) {
        console.error(err);
    }
}