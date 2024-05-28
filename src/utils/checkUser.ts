// import { fetchData } from "../database/fetch";
import { indexerClient } from "./constants";
import { base64ToUTF8String, utf8ToBase64String } from "./conversion";

export const checkUser = async (username: string) => {
  if (username.trim() === "") {
    return "Username cannot be empty";
  }

  if (username.length < 3) {
    return "Username must be at least 3 characters";
  }
  console.log(username);
  // try {
  //   let userNames: string[] = [];
  //   const appIds = await fetchData("users");
  //   console.log("appIds", appIds);
  //   if (appIds.length === 0) {
  //     return "Username is available";
  //   }
  //   const getField = (
  //     fieldName:
  //       | WithImplicitCoercion<string>
  //       | { [Symbol.toPrimitive](hint: "string"): string },
  //     globalState: any[]
  //   ) => {
  //     return globalState.find((state) => {
  //       return state.key === utf8ToBase64String(fieldName);
  //     });
  //   };

  //   try{
  //   await Promise.all(
  //     appIds.map(async (item: any) => {
  //       let transactionInfo = await indexerClient
  //         .lookupApplications(item.appId).includeAll(true)
  //         .do();

  //       if (transactionInfo.application.deleted) {
  //         return null;
  //       }
  //       let globalState = transactionInfo.application.params["global-state"];

  //       if (getField("USERNAME", globalState) !== undefined) {
  //         let field = getField("USERNAME", globalState).value.bytes;
  //         userNames.push(base64ToUTF8String(field));
  //       }
  //     })
  //   );
  //   if (userNames.includes(username)) {
  //     return "Username is already taken";
  //   } else {
  //     return "Username is available";
  //   }
  // } catch (err) {
  //   console.log(err);
  //   return "Something went wrong";
  // }} catch (err) {
  //   console.log(err);
  //   return "Something went wrong";
  // }
};
