import { fetchData, fetchUserData } from "./fetchData";

export const checkUser = async (
  username: string,
  accountAddress?: string
): Promise<string> => {
  if (username.trim() === "") {
    return "Username cannot be empty";
  }

  if (username.length < 3) {
    return "Username must be at least 3 characters";
  }

  if (username.length >= 20) {
    return "Username must be less than 20 characters";
  }

  const usernameRegex = /^[a-zA-Z0-9]+$/;
  if (!usernameRegex.test(username)) {
    return "Username can only contain alphanumeric characters";
  }

  const transactionArray = await fetchData();
  if (transactionArray["transactions"].length === 0) {
    return "Username is available";
  }
  if (transactionArray["transactions"].length > 0) {
    const userNames: string[] = [];
    let matchUser: boolean = true;
    for (const item of transactionArray["transactions"]) {
      const appId = item["created-application-index"];
      const userData = await fetchUserData(appId);
      if (userData === null) continue;

      const userName = userData[0].username ?? "";
      userNames.push(userName.trim());

      const userdata = userData.find((user) => user.owner === accountAddress);
      if (
        userdata &&
        userNames.includes(username.trim()) &&
        userdata.username !== username
      ) {
        matchUser = false;
      }
    }

    if (!matchUser) {
      return "Username is registered with another address";
    }

    if (userNames.includes(username.trim())) {
      return "Username is not available";
    }
    return "Username is available";
  }
  return "Something went wrong please try again";
};
