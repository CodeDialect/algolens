"use client";

import {
  Box,
  Flex,
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Stack,
  Center,
  Image,
  Link,
  useToast,
} from "@chakra-ui/react";
import { signin } from "../utils/sigin";
import { PeraWalletConnect } from "@perawallet/connect";
import { useEffect, useState } from "react";
import { fetchUsers, UserData } from "../utils/fetchUsers";

interface NavProps {
  children: React.ReactNode;
  accountAddress: string | null;
  username: string;
  handleConnectWalletClick: () => void;
  handleDisconnectWalletClick: () => void;
  peraWallet: PeraWalletConnect;
}

export default function Nav({
  children,
  accountAddress,
  handleConnectWalletClick,
  handleDisconnectWalletClick,
  peraWallet,
  username,
}: NavProps) {
  const toast = useToast();

  const [userData, setUserData] = useState<UserData[]>();
  useEffect(() => {
    const fetchUserData = async () => {
      const result = await fetchUsers();
      if (typeof result === "string") {
        setUserData([]);
      } else {
        setUserData(result);
      }
    };

    fetchUserData();
  });

  const handleLogout = async () => {
    if (username !== "" && accountAddress) {
      await signin(username, accountAddress, peraWallet, "logout");
      toast({
        title: "Success",
        description: "Logged out successfully",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const user =
    userData &&
    userData.find(
      (user) => user.owner === accountAddress && user.username === username
    );
  const profilePicture = user && user.profilePicture ? user.profilePicture : "";
  return (
    <>
      <Box
        backgroundImage={"linear-gradient(195deg, rgb(0 0 0), rgb(88 26 232))"}
        px={4}
      >
        <Flex h={16} justifyContent={"space-between"}>
          <Stack
            as={Link}
            href="/"
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Image maxW={"60%"} src="logotop.png" alt="logo" />
          </Stack>
          <Flex alignItems={"center"}>
            <Stack direction={"row"} spacing={7}>
              {!accountAddress ? (
                <Button
                  _hover={{
                    transform: "scale(1.05)",
                    transition: "transform 0.3s ease-in-out",
                  }}
                  color={"white"}
                  backgroundImage={
                    "linear-gradient(195deg, rgb(0 0 0), rgb(88 26 232))"
                  }
                  onClick={() => handleConnectWalletClick()}
                >
                  Connect to Pera Wallet
                </Button>
              ) : username === "" ? (
                <Button
                  _hover={{
                    transform: "scale(1.05)",
                    transition: "transform 0.3s ease-in-out",
                  }}
                  color={"white"}
                  backgroundImage={
                    "linear-gradient(195deg, rgb(0 0 0), rgb(88 26 232))"
                  }
                  onClick={() => handleDisconnectWalletClick()}
                >
                  Disconnect
                </Button>
              ) : (
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded={"full"}
                    variant={"link"}
                    cursor={"pointer"}
                    minW={0}
                  >
                    <Avatar size={"sm"} src={profilePicture} />
                  </MenuButton>
                  <MenuList alignItems={"center"}>
                    <br />
                    <Center>
                      <Avatar size={"2xl"} src={profilePicture} />
                    </Center>
                    <br />
                    <Center>
                      <p>
                        {username.charAt(0).toUpperCase() +
                          username.slice(1).toLowerCase()}
                      </p>
                    </Center>
                    <br />
                    <MenuDivider />
                    <MenuItem onClick={() => handleLogout()}>Logout</MenuItem>
                    <MenuItem onClick={() => handleDisconnectWalletClick()}>
                      Disconnect Wallet
                    </MenuItem>
                  </MenuList>
                </Menu>
              )}
            </Stack>
          </Flex>
        </Flex>
      </Box>
      {children}
    </>
  );
}
