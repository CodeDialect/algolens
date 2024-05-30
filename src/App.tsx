import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Home } from "./pages/home";
import LoginPage from "./pages/login";
import ProfilePage from "./pages/profile";
import { useEffect, useState } from "react";
import Nav from "./component/Navbar";
import { PeraWalletConnect } from "@perawallet/connect";
import { postNote, userNote } from "./utils/constants";
import {
  fetchAppUser,
  fetchUserPosts,
  PostData,
  UserData,
} from "./utils/fetchData";
import { Box, Flex, Spinner } from "@chakra-ui/react";

const App = () => {
  const [accountAddress, setAccountAddress] = useState("");
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData[]>();
  const [postData, setPostData] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const peraWallet = new PeraWalletConnect({
    chainId: 416002,
  });

  const getUsername = (key: string): string => {
    const username = localStorage.getItem(key);
    return username !== null ? username : "";
  };

  useEffect(() => {
    peraWallet.reconnectSession().then((accounts) => {
      peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
      setAccountAddress(accounts[0]);
    });

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  });

  function handleDisconnectWalletClick() {
    peraWallet.disconnect();
    localStorage.removeItem("username");
    setAccountAddress("");
  }

  function handleConnectWalletClick() {
    peraWallet
      .connect()
      .then((newAccounts) => {
        // Setup the disconnect event listener
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
        setAccountAddress(newAccounts[0]);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  useEffect(() => {
    async function fetchPostData() {
      if (accountAddress) {
        setIsLoading(true);
        const posts = await fetchUserPosts(postNote);
        if (typeof posts === "string") {
          return posts;
        }
        if (posts && posts.postsData) {
          setPostData(
            posts.postsData.map((post) => ({
              post: post.post,
              owner: post.owner,
              postBy: post.postBy,
              timestamp: new Date(Number(post.timestamp) * 1000),
              id: post.id,
            }))
          );
        } else {
          // Handle the case when posts is null or undefined
          // You can set postData to an empty array or display an error message
          setPostData([]);
        }
        setIsLoading(false);
      }
    }
    fetchPostData();
  }, [accountAddress, setPostData]);

  useEffect(() => {
    async function fetchUserData() {
      if (accountAddress) {
        setIsLoading(true);
        const user = await fetchAppUser(accountAddress, userNote);
        if (user) {
          setUserData(user?.userData || []);
        }
        setIsLoading(false);
      }
    }
    fetchUserData();
    console.log(userData)
  }, [accountAddress, setUserData]);

  return isLoading ? (
    <Flex justifyContent="center" alignItems="center" height="100vh">
      <Box width="100px" height="100px">
        <Spinner
          thickness="50px"
          speed="0.65s"
          emptyColor="gray.200"
          color="purple.500"
        />
      </Box>
    </Flex>
  ) : (
    <>
    <Nav
      username={getUsername("username")}
      accountAddress={accountAddress}
      peraWallet={peraWallet}
      userData={userData}
      handleConnectWalletClick={handleConnectWalletClick}
      handleDisconnectWalletClick={handleDisconnectWalletClick}
    />
      <Router>
        <Switch>
          <Route
            exact
            path="/"
            render={() =>
              accountAddress && getUsername("username") !== "" && userData?.length !== 0 ? (
                <Home
                  postsData={postData}
                  userData={userData}
                  username={getUsername("username")}
                  peraWallet={peraWallet}
                  accountAddress={accountAddress}
                />
              ) : (
                <LoginPage
                  peraWallet={peraWallet}
                  accountAddress={accountAddress}
                />
              )
            }
          />
          <Route
            path="/profile"
            render={() =>
              accountAddress && getUsername("username") !== "" && userData?.length !== 0 ? (
                <ProfilePage
                  username={getUsername("username")}
                  accountAddress={accountAddress}
                  peraWallet={peraWallet}
                  userData={userData}
                  postData={postData}
                />
              ) : (
                <LoginPage
                  peraWallet={peraWallet}
                  accountAddress={accountAddress}
                />
              )
            }
          />
        </Switch>
      </Router>
      </>
  );
};

export default App;
