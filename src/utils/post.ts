import {
  algodClient,
  numGlobalBytes,
  numGlobalInts,
  numLocalBytes,
  numLocalInts,
  postNote,
  userNote,
} from "./constants";
import algosdk from "algosdk";
import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";
import { PeraWalletConnect } from "@perawallet/connect";
import { fetchAppUser } from "./fetchData";

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

    if(user === null) return "User not found";
    
    if (user.appId === undefined) {
      return "User not found";
    }

    if (user.userData === undefined || user.userData === null) {
      return "User not found or Deleted";
    }

    if (user.userData[0].loginStatus === 0) {
      return "User not logged in";
    }

    const loginCheckOp = new TextEncoder().encode("check_post");
    const args = [
      loginCheckOp,
      new TextEncoder().encode(user.userData[0].username),
    ];
    const userId = new TextEncoder().encode(user.appId.toString());
    const post = new TextEncoder().encode(postContent);
    const appPostArgs = [post, userId];
    const loginTnx = algosdk.makeApplicationCallTxnFromObject({
      from: senderAddress,
      suggestedParams: params,
      appIndex: user.appId,
      appArgs: args,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
    });

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

    algosdk.assignGroupID([loginTnx, txn]);

    const multipleTxnGroups: SignerTransaction[] = [
      { txn: loginTnx, signers: [senderAddress] },
      { txn: txn, signers: [senderAddress] },
    ];

    let signedTxn = await perawallet.signTransaction([multipleTxnGroups]);
    let tx = await algodClient.sendRawTransaction(signedTxn).do();
    let confirmedTxn = await algosdk
      .waitForConfirmation(algodClient, tx.txId.toString(), 4)
      .catch(async (err) => {
        try {
          let transactionResponse = await algodClient
            .pendingTransactionInformation(tx.txId.toString())
            .do();
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
          return transactionResponse;
        } catch (err) {
          throw err;
        }
      });
    // Get the completed Transaction
    console.log(
      "Transaction " +
        tx.txId.toString() +
        " confirmed in round " +
        confirmedTxn["confirmed-round"]
    );
    return "Post Successful";
  } catch (error) {
    console.log(error);
  }
};
