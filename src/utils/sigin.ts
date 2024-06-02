import { algodClient, userNote } from "./constants";
import algosdk from "algosdk";
import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";
import { PeraWalletConnect } from "@perawallet/connect";
import { fetchAppUser } from "./fetchData";

export const signin = async (
  senderAddress: string,
  perawallet: PeraWalletConnect,
  op: string
) => {
  const setUser = async (key: string, value: string) => {
    if (value === "") {
      localStorage.removeItem(key);
    }

    localStorage.setItem(key, value);
  };

  const operation = new TextEncoder().encode(op);

  let params = await algodClient.getTransactionParams().do();
  params.fee = algosdk.ALGORAND_MIN_TX_FEE;
  params.flatFee = true;

  if (senderAddress === null) {
    throw new Error("Please connect your wallet");
  }

  try {
    const user = await fetchAppUser(senderAddress, userNote);
    if(user === null) {
      return "User not found";
    }
    
    if (user.appId === undefined) {
      return "User not found";
    }
    
    if (user.userData === null) {
      return "User is not registered with connected wallet";
    }

    if (user.userData[0].loginStatus === 1 && op === "login") {
      return "User already loggedin on another device";
    }

    let appArgs = [operation, new TextEncoder().encode(user.userData[0].username)];
    try {
      const signTxn = algosdk.makeApplicationCallTxnFromObject({
        from: senderAddress,
        appIndex: user.appId,
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

      const signedTxn = await perawallet.signTransaction([singleTransaction]);
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
        return "logged out successfully";
      }

      if (op === "login") {
        setUser("username", user.userData[0].username ?? "");
        return "logged in successfully";
      }
      console.log("Signed transaction with txID: %s", txId);
    } catch (error) {
      console.log("Rejected by User or Something went wrong please try again", error);
    }
  } catch (err) {
    console.log(err);
  }
};
