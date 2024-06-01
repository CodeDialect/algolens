import { fetchData, fetchUserData } from "./fetchData";


export const checkUser = async (username: string): Promise<string> => {
  if (username.trim() === "") {
    return "Username cannot be empty";
  }

  if (username.length < 3) {
    return "Username must be at least 3 characters";
  }

  const usernameRegex = /^[a-zA-Z0-9]+$/;
  if (!usernameRegex.test(username)) {
    return "Username can only contain alphanumeric characters";
  }

  // Introduce a delay of 1 second (1000 milliseconds)
  await new Promise((resolve) => setTimeout(resolve, 500));

  const transactionArray = await fetchData();
  if (transactionArray["transactions"].length === 0) {
    return "Username is available";
  }
  if (transactionArray["transactions"].length > 0) {
    const userNames: string[] = [];
    for (const item of transactionArray["transactions"]) {
      const appId = item["created-application-index"];
      const userData = await fetchUserData(appId);
      if (userData === null) continue;
      const userName = userData[0].username ?? "";
      userNames.push(userName.trim());
    }
    if (userNames.includes(username.trim())) {
      return "Username is not available";
    }
    return "Username is available";
  }
  return "Something went wrong please try again";
};