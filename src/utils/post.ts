import {
  algodClient,
  indexerClient,
  numGlobalBytes,
  numGlobalInts,
  numLocalBytes,
  numLocalInts,
  postNote,
  userNote,
} from "./constants";
import { utf8ToBase64String, base64ToUTF8String } from "./conversion";
import algosdk from "algosdk";
import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";
import { PeraWalletConnect } from "@perawallet/connect";
import { fetchAppUser, fetchUserData } from "./fetchData";

export const post = async (
  senderAddress: any,
  perawallet: PeraWalletConnect,
  postContent: string
) => {
  global.Buffer = global.Buffer || require("buffer").Buffer;

  const approvalProgramUrl = "../newContracts/posts/posts_approval.teal";
  const clearProgramUrl = "../newContracts/posts/posts_clear.teal";

  let params = await algodClient.getTransactionParams().do();
  params.fee = algosdk.ALGORAND_MIN_TX_FEE;
  params.flatFee = true;

  async function fetchFile(url: RequestInfo | URL) {
    const response = await fetch(url);
    const fileContent = await response.text();
    return fileContent;
  }

  const approvalProgram = async () => await fetchFile(approvalProgramUrl);
  const clearProgram = async () => await fetchFile(clearProgramUrl);

  const compileProgram = async (programSource: string | undefined) => {
    let encoder = new TextEncoder();
    let programBytes = encoder.encode(programSource);
    let compileResponse = await algodClient
      .compile(programBytes)
      .do()
      .catch((err) => {
        console.log(err);
      });
    return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
  };

  const compiledApprovalProgram = await compileProgram(await approvalProgram());
  const compiledClearProgram = await compileProgram(await clearProgram());

  try {
    if (senderAddress === null) {
      throw new Error("Please connect your wallet");
    }
    const user = await fetchAppUser(senderAddress, userNote);

    if (user.appId === undefined) {
      return "User not found";
    }

    // const user = await fetchUserData(userAppId);

    if (user.userData === undefined || user.userData === null) {
      return "User not found or Deleted";
    }

    if (user.userData[0].loginStatus === 0) {
      return "User not logged in";
    }

    const loginCheckOp = new TextEncoder().encode("check_post");

    const args = [loginCheckOp, new TextEncoder().encode(user.userData[0].username)];

    const loginTnx = algosdk.makeApplicationCallTxnFromObject({
      from: senderAddress,
      suggestedParams: params,
      appIndex: user.appId,
      appArgs: args,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
    });

    const signTransaction: SignerTransaction[] = [
      {
        txn: loginTnx,
        signers: [senderAddress],
      },
    ];
    console.log(signTransaction);
    console.log(args);

    try {
      const signedTxn = await perawallet.signTransaction([signTransaction]);
      console.log(signedTxn);
      await algodClient
        .sendRawTransaction(signedTxn[0])
        .do()
        .then(async () => {
          const userId = new TextEncoder().encode(user.appId.toString());
          const post = new TextEncoder().encode(postContent);
          let appPostArgs = [post, userId];
          let txn = algosdk.makeApplicationCreateTxnFromObject({
            from: senderAddress,
            suggestedParams: params,
            onComplete: algosdk.OnApplicationComplete.NoOpOC,
            approvalProgram: compiledApprovalProgram,
            clearProgram: compiledClearProgram,
            numLocalInts: numLocalInts,
            numLocalByteSlices: numLocalBytes,
            numGlobalInts: numGlobalInts,
            numGlobalByteSlices: numGlobalBytes,
            note: postNote,
            appArgs: appPostArgs,
          });

          const singleTransaction: SignerTransaction[] = [
            {
              txn: txn,
              signers: [senderAddress],
            },
          ];

          let txId = txn.txID().toString();

          try {
            const signedTxn = await perawallet.signTransaction([
              singleTransaction,
            ]);
            console.log(signedTxn);
            await algodClient.sendRawTransaction(signedTxn[0]).do();
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

          // Get created application id and notify about completion
          let transactionResponse = await algodClient
            .pendingTransactionInformation(txId)
            .do()
            .catch(async (err) => {
              try {
                if (transactionResponse?.["application-index"] === undefined) {
                  return err;
                }

                const postAppId = transactionResponse["application-index"];
                let deletePost = algosdk.makeApplicationDeleteTxnFromObject({
                  from: senderAddress,
                  suggestedParams: params,
                  appIndex: postAppId,
                });

                const singleTransaction: SignerTransaction[] = [
                  {
                    txn: deletePost,
                    signers: [senderAddress],
                  },
                ];

                let txId = deletePost.txID().toString();
                const signedTxn = await perawallet.signTransaction([
                  singleTransaction,
                ]);
                await algodClient.sendRawTransaction(signedTxn[0]).do();
                console.log("Signed transaction with txID: %s", txId);
                return "Post deleted";
              } catch (err) {
                return err;
              }
            });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
};
