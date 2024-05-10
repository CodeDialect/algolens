import { getDocs, collection } from "firebase/firestore";
import { db } from "../database/firebase";
import { algodClient, indexerClient } from "./constants";
import { utf8ToBase64String, base64ToUTF8String } from "./conversion";
import algosdk from "algosdk";
import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";

export const signin = async (senderAddress: any, perawallet: any) => {
  const user = "sunny";
  const op = "logout";
  const fetchUsers: () => Promise<any> = async () =>
    await getDocs(collection(db, "products"))
      .then((querySnapshot) => {
        const newData = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          appId: doc.data().appId,
        }));
        return newData;
      })
      .catch((err) => {
        console.log(err);
      });

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
    console.log("Fetching products...");
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
        let userName = "";
        let appId = transactionInfo.application.id;
        console.log(transactionInfo);
        if (getField("USERNAME", globalState) !== undefined) {
          let field = getField("USERNAME", globalState).value.bytes;
          userName = base64ToUTF8String(field);
        }

        let signin = new TextEncoder().encode("logout");
        let signName = new TextEncoder().encode(user);

        let params = await algodClient.getTransactionParams().do();
        params.fee = algosdk.ALGORAND_MIN_TX_FEE;
        params.flatFee = true;
        if (userName === user) {
          let appArgs = [signin, signName];

          console.log(appArgs);
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

        console.log(userName, owner, appId);
      })
    );
  } catch (err) {
    console.log(err);
  }
};