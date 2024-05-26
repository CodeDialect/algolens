import { algodClient } from "./constants";
import algosdk from "algosdk";
import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";
import { PeraWalletConnect } from "@perawallet/connect";
import { fetchUsers } from "./fetchUsers";


export const signin = async (
  username: string,
  senderAddress: string | null,
  perawallet: PeraWalletConnect,
  op: string
) => {
  const setUser = async (key: string, value: string) => {
    localStorage.setItem(key, value);
  };

  const operation = new TextEncoder().encode(op);

  let params = await algodClient.getTransactionParams().do();
  params.fee = algosdk.ALGORAND_MIN_TX_FEE;
  params.flatFee = true;
  const user = new TextEncoder().encode(username);

  if (senderAddress === null) {
    throw new Error("Please connect your wallet");
  }

  try {
        const userData = await fetchUsers();
        if(userData === undefined) {
          return null
        }
        const filteredAppId = userData.filter(data => data.username === username.toLowerCase() && data.owner === senderAddress);
        
        if(filteredAppId.length === 0) {
          return null
        };
        
        const userAppId = filteredAppId[0].appId;

        if (
          userData.some(
            (data) => data.username?.toLowerCase() === username.toLowerCase()
          ) &&
          userData.some((data) => data.owner === senderAddress)
        ) {
          let appArgs = [operation, user];
          try {
            const signTxn = algosdk.makeApplicationCallTxnFromObject({
              from: senderAddress,
              appIndex: userAppId,
              onComplete: algosdk.OnApplicationComplete.NoOpOC,
              suggestedParams: params,
              appArgs: appArgs,
            });

            const singleTransaction: SignerTransaction[] = [
              {
                txn: signTxn,
                signers: [senderAddress],
              },
            ];

            let txId = signTxn.txID().toString();

            const signedTxn = await perawallet.signTransaction([
              singleTransaction,
            ]);
            await algodClient
              .sendRawTransaction(signedTxn)
              .do()
              .catch((err) => {
                console.log(err);
              });
            let confirmedTxn = await algosdk.waitForConfirmation(
              algodClient,
              txId,
              4
            );
            console.log(
              "Transaction " +
                txId +
                " confirmed in round " +
                confirmedTxn["confirmed-round"]
            );
            if (op === "logout") {
              localStorage.removeItem("username");
            }

            if (op === "login") {
              setUser("username", username);
            }
            console.log("Signed transaction with txID: %s", txId);
          } catch (error) {
            console.log("Couldn't sign Opt-in txns", error);
          }
        }
  } catch (err) {
    console.log(err);
  }
};
