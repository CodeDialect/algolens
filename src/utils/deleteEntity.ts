import { PeraWalletConnect } from "@perawallet/connect";
import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";
import algosdk from "algosdk";
import { algodClient, indexerClient, postNote} from "./constants";

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
      message: "Please connect your wallet",
    };
  }

  if (appId === null) {
    return {
      success: false,
      message: "Invalid User ID",
    };
  }
  try {
    const userPosts = await indexerClient
      .searchForTransactions()
      .address(accountAddress)
      .notePrefix(postNote)
      .txType("appl")
      .do();
    const deletePostGroup: any[] = [];

    if (userPosts["transactions"].length === 0) {
      return null
    } else {
      await Promise.all(
        userPosts.transactions.map(
          async (transaction: { [x: string]: any }) => {
            const result = await indexerClient
              .lookupApplications(transaction["created-application-index"])
              .includeAll(true)
              .do();
            if (result.application.deleted) {
              return null;
            }

            deletePostGroup.push(
              algosdk.makeApplicationDeleteTxnFromObject({
                from: accountAddress,
                appIndex: transaction["created-application-index"],
                suggestedParams: params,
              })
            );
          }
        )
      );

      if (deletePostGroup.length === 0) {
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

        let signedDelAppTxn = await peraWallet.signTransaction([
          singleTransaction,
        ]);

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
          message: "User deleted successfully",
        };
      } else {
        algosdk.assignGroupID(deletePostGroup);

        const multipleTxnGroups: SignerTransaction[] = [];
        deletePostGroup.map((txn) => {
          return multipleTxnGroups.push({
            txn: txn,
            signers: [accountAddress],
          });
        });

        let signedTxn = await peraWallet.signTransaction([multipleTxnGroups]);
        let tx = await algodClient.sendRawTransaction(signedTxn).do();
        await algosdk
          .waitForConfirmation(algodClient, tx.txId, 4)
          .then(async () => {
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

            let signedDelAppTxn = await peraWallet.signTransaction([
              singleTransaction,
            ]);

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
              message: "User deleted successfully",
            };
          })
          .catch(() => {
            return {
              success: false,
              message: "Failed to delete user",
            };
          });
      }
    }
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete user",
    };
  }
};
