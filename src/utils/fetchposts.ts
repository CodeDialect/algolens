import { fetchData } from "../database/fetch";
import { indexerClient } from "./constants";
import { base64ToUTF8String, utf8ToBase64String } from "./conversion";
export interface PostData {
  post: string | undefined;
  time: Date;
  post_by: string | undefined;
  owner_address: string | undefined;
  username: string | undefined;
}

export const fetchAndProcessPosts = async (
  setPostData: React.Dispatch<React.SetStateAction<PostData[]>>,
  username: string,
  filtering: boolean
) => {
  const newPostData: PostData[] = [];
  const postIds = await fetchData("posts");
  const userIds = await fetchData("users");

  if (postIds === undefined || userIds === undefined) {
    return "Something went wrong!";
  }

  console.log("postIds:", postIds);
  console.log("userIds:", userIds);

  const getField = (fieldName: any, globalState: any[]) => {
    return globalState.find((state) => {
      return state.key === utf8ToBase64String(fieldName);
    });
  };

  const maxTries = 3;
  for (let i = 0; i < maxTries; i++) {
    try {
      await Promise.all(
        postIds.map(async (item: { appId: number }) => {
          let transactionInfo = await indexerClient
            .lookupApplications(item.appId)
            .includeAll(true)
            .do();
          let globalState = transactionInfo.application.params["global-state"];

          const post_by = base64ToUTF8String(
            getField("POSTBY", globalState).value.bytes
          );
          const userAppId = userIds.find(
            (user: { appId: string }) => user.appId === post_by
          )?.appId;
          if (userAppId) {
            let userTransactionInfo = await indexerClient
              .lookupApplications(userAppId)
              .includeAll(true)
              .do();
            let userGlobalState =
              userTransactionInfo.application.params["global-state"];
            const users = base64ToUTF8String(
              getField("USERNAME", userGlobalState).value.bytes
            );

            newPostData.push({
              post: base64ToUTF8String(getField("POST", globalState).value.bytes),
              time: new Date(getField("TIME", globalState).value.uint * 1000),
              post_by,
              owner_address: transactionInfo.application.params.creator,
              username: users,
            });
          }
        })
      );
      break; // Exit the loop if the request is successful
    } catch (err) {
      if (i === maxTries - 1) {
        throw err; // Throw the error if all tries have been exhausted
      }
    }
  }

  console.log("newPostData:", newPostData);

  let updatedPosts = newPostData;
  if (filtering) {
    setPostData(newPostData.filter((user) => user.username === username));
    return;
  }

  console.log("updatedPosts:", updatedPosts);

  setPostData(updatedPosts); // Filter out any undefined entries before setting the state
};