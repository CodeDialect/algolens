import { fetchData } from "../database/fetch";
import { indexerClient } from "./constants";
import { utf8ToBase64String, base64ToUTF8String } from "./conversion";

export interface UserData {
    username: string | undefined;
    owner: string;
    appId: number;
    profilePicture: string | undefined;
}

export const fetchUsers = async () => {
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
            let profilePicture;
            let appId = transactionInfo.application.id;
            if (getField("USERNAME", globalState) !== undefined) {
              let field = getField("USERNAME", globalState).value.bytes;
              registeredUsername = base64ToUTF8String(field);
            }
            if (getField("PICTURE", globalState) !== undefined) {
              let field = getField("PICTURE", globalState).value.bytes;
              profilePicture = base64ToUTF8String(field);
            }
            userData.push({
              username: registeredUsername,
              owner: owner,
              appId: appId,
              profilePicture: profilePicture,
            });
        })
        );
        return userData;
      } catch (err) {
        console.log(err);
      }  
} 