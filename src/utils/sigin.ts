import { algodClient, indexerClient } from "./constants";
import { utf8ToBase64String, base64ToUTF8String } from "./conversion";
import algosdk from "algosdk";
import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";
import { PeraWalletConnect } from "@perawallet/connect";
import { fetchUsers } from "../database/fetch";

interface UserData {
  username: string | undefined;
  owner: string;
}

export const signin = async (
  username: string,
  senderAddress: string,
  perawallet: PeraWalletConnect,
  op: string
) => {
  const operation = new TextEncoder().encode(op);

  let params = await algodClient.getTransactionParams().do();
  params.fee = algosdk.ALGORAND_MIN_TX_FEE;
  params.flatFee = true;
  const user = new TextEncoder().encode(username);

  try {
    const appIds = await fetchUsers();
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
    let userData: UserData[] = [];
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
        let owner = transactionInfo.application.params.creator;
        let registeredUsername;
        let appId = transactionInfo.application.id;
        console.log(transactionInfo);
        if (getField("USERNAME", globalState) !== undefined) {
          let field = getField("USERNAME", globalState).value.bytes;
          registeredUsername = base64ToUTF8String(field);
        }
        userData.push({
          username: registeredUsername,
          owner: owner,
        });

        console.log(userData);
        if (
          userData.some((data) => data.username?.toLowerCase() === username.toLowerCase()) &&
          userData.some((data) => data.owner === senderAddress)
        ) {
          console.log("Signed in");
          let appArgs = [operation, user];
          console.log(op);
          const signTxn = algosdk.makeApplicationCallTxnFromObject({
            from: senderAddress,
            appIndex: appId,
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

          try {
            const signedTxn = await perawallet.signTransaction([
              singleTransaction,
            ]);
            console.log(signedTxn);
            const result = await algodClient
              .sendRawTransaction(signedTxn)
              .do()
              .catch((err) => {
                console.log(err);
              });
            console.log("Result: ", result);
          } catch (error) {
            console.log("Couldn't sign Opt-in txns", error);
          }
          console.log("Signed transaction with txID: %s", txId);

          // Wait for transaction to be confirmed
          let confirmedTxn = await algosdk.waitForConfirmation(
            algodClient,
            txId,
            4
          );

          // Get the completed Transaction
          console.log(
            "Transaction " +
              txId +
              " confirmed in round " +
              confirmedTxn["confirmed-round"]
          );
        }
      })
    );
  } catch (err) {
    console.log(err);
  }
};
