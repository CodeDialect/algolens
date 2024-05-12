import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { Home } from "./pages/home";
import LoginPage from "./pages/login";
import ProfilePage from "./pages/profile";
import { useEffect, useState } from "react";
import Nav from "./component/Navbar";
import { PeraWalletConnect } from "@perawallet/connect";

const App = () => {
  const [accountAddress, setAccountAddress] = useState("" as string | null);

  const peraWallet = new PeraWalletConnect({
    chainId: 416002,
  });

  const getUsername = (key: string): string => {
    const username = localStorage.getItem(key);
    return username !== null ? username : "";
  };

  useEffect(() => {
    // Reconnect to the session when the component is mounted
    peraWallet.reconnectSession().then((accounts) => {
      // Setup the disconnect event listener
      peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);
      setAccountAddress(accounts[0]);
    });
  });

  function handleDisconnectWalletClick() {
    peraWallet.disconnect();
    localStorage.removeItem("username");
    setAccountAddress(null);
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
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <Nav
      username={getUsername("username")}
      accountAddress={accountAddress}
      peraWallet={peraWallet}
      handleConnectWalletClick={handleConnectWalletClick}
      handleDisconnectWalletClick={handleDisconnectWalletClick}
    >
      <Router>
        <Switch>
          <Route
            exact
            path="/"
            render={() =>
              accountAddress && getUsername("username") === "" ? (
                <LoginPage
                  peraWallet={peraWallet}
                  accountAddress={accountAddress}
                />
              ) : (
                <Home />
              )
            }
          />
          <Route
            path="/profile"
            render={() =>
              accountAddress && getUsername("username") !== "" ? (
                <ProfilePage username={getUsername("username")} />
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
    </Nav>
  );
};

export default App;
