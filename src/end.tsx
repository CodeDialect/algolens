import { useEffect, useState } from "react";
import "./App.css";
import { PeraWalletConnect } from "@perawallet/connect";
import { createProductAction, getProductsAction } from "./utils/marketplace";
import { Box, Button } from "@chakra-ui/react";


function End() {
  const [accountAddress, setAccountAddress] = useState("" as string | null);
  const isConnectedToPeraWallet = !!accountAddress;

  const peraWallet = new PeraWalletConnect({
    chainId: 416002
  });

  useEffect(() => {
    // Reconnect to the session when the component is mounted
    peraWallet.reconnectSession().then((accounts) => {
      // Setup the disconnect event listener
      peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);

      if (accounts.length) {
        setAccountAddress(accounts[0]);
      }
    });
  });
  console.log(accountAddress);
  return (
    <>
    <Box className="App">
      <Button
        onClick={() =>
          createProductAction(peraWallet, accountAddress, {
            name: "Test Product",
            image: "https://picsum.photos/200",
            description: "Test Description",
            price: 10,
          })
        }
      >
        Create Test Product
      </Button>
      <Button onClick={() => getProductsAction()}>
        Get Products
      </Button>
      <Button
        onClick={
          isConnectedToPeraWallet
            ? handleDisconnectWalletClick
            : handleConnectWalletClick
        }
      >
        {isConnectedToPeraWallet ? "Disconnect" : "Connect to Pera Wallet"}
      </Button>
    </Box>
    </>
  );

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

  function handleDisconnectWalletClick() {
    peraWallet.disconnect();
    setAccountAddress(null);
  }
}

export default End;
