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
import { UserData } from "../utils/fetchData";
import { postNote, userNote } from "../utils/constants";
import { post } from "../utils/post";

interface NavProps {
  children: React.ReactNode;
  accountAddress: string;
  username: string;
  handleConnectWalletClick: () => void;
  handleDisconnectWalletClick: () => void;
  peraWallet: PeraWalletConnect;
  userData: UserData[] | undefined;
}

export default function Nav({
  children,
  accountAddress,
  handleConnectWalletClick,
  handleDisconnectWalletClick,
  peraWallet,
  username,
  userData
}: NavProps) {
  const toast = useToast();
  const handleLogout = async () => {
    if (username !== "" && accountAddress) {
      const result = await signin(
        username,
        accountAddress,
        peraWallet,
        "logout"
      );
      toast({
        title: "Success",
        description: result,
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    }
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };


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
                    <Avatar
                      size={"sm"}
                      src={
                        userData
                          ? userData[0].profilePicture
                          : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDmELpn2iH-dqdj8jeC4RJ471P3VbIwr2C0OO1KntBPA&s"
                      }
                    />
                  </MenuButton>
                  <MenuList alignItems={"center"}>
                    <br />
                    <Center>
                      <Avatar
                        size={"2xl"}
                        src={userData ? userData[0].profilePicture : ""}
                      />
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
