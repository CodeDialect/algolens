import { indexerClient, postNote, userNote } from "./constants";
import { base64ToUTF8String, utf8ToBase64String } from "./conversion";

export interface UserData {
  id: number;
  username: string | undefined;
  owner: string;
  loginStatus: number;
  profilePicture: string | undefined;
}

export interface PostData {
  id: number;
  post: string;
  owner: string;
  postBy: string;
  timestamp: Date;
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

export const fetchAppUser = async (
  senderAddress: string,
  notePrefix: Uint8Array,
) => {
  const response = await indexerClient
    .searchForTransactions()
    .notePrefix(notePrefix)
    .address(senderAddress)
    .txType("appl")
    .limit(1)
    .do();
  if(response["transactions"].length === 0) return null
  const appId: number = response["transactions"][0]["created-application-index"];
  const userData = await fetchUserData(appId);
  return { userData, appId };
};

export const fetchUserData = async (appId: number) => {
  const userData: UserData[] = [];

  const response = await indexerClient
    .lookupApplications(appId)
    .includeAll(true)
    .do();

  if (response.application.deleted === true) {
    return null;
  }

  const globalState = await response.application.params["global-state"];
  if (globalState === undefined) return null;
  userData.push({
    username: base64ToUTF8String(getField("USERNAME", globalState).value.bytes),
    owner: response.application.params.creator,
    profilePicture: base64ToUTF8String(
      getField("PICTURE", globalState).value.bytes
    ),
    loginStatus: getField("LOGINSTATUS", globalState).value.uint,
    id: response.application.id,
  });
  return userData;
};

export const fetchUserPosts = async (
  notePrefix: Uint8Array
) => {
  const response = await indexerClient
    .searchForTransactions().minRound(40395259)
    .notePrefix(notePrefix)
    .txType("appl")
    .do()
    .catch((error) => {
      console.log(error);
      return { transactions: [] };
    });

  if (response["transactions"].length === 0) {
    return "No posts found";
  }

  const applicationTransactions = response.transactions.map(
    (transaction: { [x: string]: any }) =>
      transaction["created-application-index"]
  );
  const postsData = await fetchPostsData(applicationTransactions);
  return { postsData, applicationTransactions };
};

export const fetchPostsData = async (appIds: number[]) => {
  const posts: PostData[] = [];

  const responses = await Promise.all(
    appIds.map(async (appId: number) => {
      const response = await indexerClient
        .lookupApplications(appId)
        .includeAll(true)
        .do();
      return response;
    })
  );

  for (const response of responses) {
    if(response === null) return null
    if (response.application.deleted === true) {
      continue;
    }

    const globalState = response.application.params["global-state"];

    posts.push({
      post: base64ToUTF8String(getField("POST", globalState).value.bytes),
      owner: response.application.params.creator,
      postBy: base64ToUTF8String(getField("POSTBY", globalState).value.bytes),
      timestamp: getField("TIME", globalState).value.uint,
      id: response.application.id,
    });
  }
  return posts;
};

export const updatePostBy = async (
  appId: number,
) => {
  const params = await indexerClient
    .lookupApplications(appId)
    .includeAll(true)
    .do();
  const globalState = params.application.params["global-state"];
  if (globalState === undefined) return null;
  const username = base64ToUTF8String(getField("USERNAME", globalState).value.bytes);
  return username;
}


export async function fetchData() {
  const response = await indexerClient
    .searchForTransactions()
    .notePrefix(userNote).minRound(40395259)
    .do();
    return response
}
