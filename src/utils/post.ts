import {
  algodClient,
  indexerClient,
  numGlobalBytes,
  numGlobalInts,
  numLocalBytes,
  numLocalInts,
} from "./constants";
import { utf8ToBase64String, base64ToUTF8String } from "./conversion";
import algosdk from "algosdk";
import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";
import { PeraWalletConnect } from "@perawallet/connect";
import { fetchData } from "../database/fetch";
import { appIdDB } from "../database/add";

interface UserData {
  username: string | undefined;
  owner: string;
  appId: number;
}

export const post = async (
  username: string,
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

    const appIds = await fetchData("users");

    if(appIds.length === 0){ 
      return "Something went wrong!";
    }

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
        if (getField("USERNAME", globalState) !== undefined) {
          let field = getField("USERNAME", globalState).value.bytes;
          registeredUsername = base64ToUTF8String(field);
        }
        userData.push({
          username: registeredUsername,
          owner: owner,
          appId: appId,
        });

        const filteredAppId = userData.filter(
          (data) =>
            data.username === username.toLowerCase() &&
            data.owner === senderAddress
        );

        console.log("filteredAppId", filteredAppId);

        if (filteredAppId.length === 0) {
          return null;
        }

        console.log("UserData", filteredAppId[0].appId, filteredAppId[0].username);  
          const userAppId = filteredAppId[0].appId
          const user = new TextEncoder().encode(filteredAppId[0].username);
          
          const loginCheckOp = new TextEncoder().encode("check_post");
          const args = [loginCheckOp, user];
          
          const loginTnx = algosdk.makeApplicationCallTxnFromObject({
            from: senderAddress,
            suggestedParams: params,
            appIndex: userAppId,
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
            const signedTxn = await perawallet.signTransaction([
              signTransaction,
            ]);
            console.log(signedTxn);
            await algodClient
              .sendRawTransaction(signedTxn[0])
              .do()
              .then(async () => {
                const userId = new TextEncoder().encode(userAppId.toString());
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
                  await algodClient
                    .sendRawTransaction(signedTxn[0])
                    .do()
                    .catch((err) => {
                      console.log(err);
                    });
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
                  .do();
                console.log("Transaction Response", transactionResponse);
                let postAppId = transactionResponse["application-index"];
                appIdDB(postAppId, "posts");
                console.log(transactionResponse);
                console.log("Created new app-id: ", postAppId);
              })
              .catch((err) => {
                console.log(err);
              });
          } catch (error) {
            console.log(error);
          }
      })
    );
  } catch (error) {
    console.log(error);
  }
};
