import { PeraWalletConnect } from "@perawallet/connect";
import { algodClient } from "./constants";
import algosdk from "algosdk";
import { fetchData } from "../database/fetch";
import { utf8ToBase64String } from "./conversion";
import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";

export const Like = async (
  username: string,
  accountAddress: string | null,
  peraWallet: PeraWalletConnect,
  postBy: string | undefined
) => {
  if (accountAddress === null) {
    throw new Error("Please connect your wallet");
  }

  const operation = new TextEncoder().encode("like");

  let params = await algodClient.getTransactionParams().do();
  params.fee = algosdk.ALGORAND_MIN_TX_FEE;
  params.flatFee = true;
  const user = new TextEncoder().encode(username);

  try {
    const appIds = await fetchData("users");
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

    try {
      if (appIds.length === 0) {
        throw new Error("No user found");
      }

      const transaction = algosdk.makeApplicationNoOpTxnFromObject({
        from: accountAddress,
        appIndex: 0,
        appArgs: [operation, user],
        suggestedParams: params,
      });

      const signTransaction: SignerTransaction[] = [
        {
          txn: transaction,
          signers: [accountAddress],
        },
      ];
      const signedTxn = await peraWallet.signTransaction([signTransaction]);
      const tx = await algodClient.sendRawTransaction(signedTxn).do();
      const txId = tx.txId;
      const status = await algosdk.waitForConfirmation(algodClient, txId, 4);
      console.log("Transaction " + txId + " confirmed in round " + status["confirmed-round"]);

      return txId;
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
};
