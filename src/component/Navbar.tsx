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
                      src={"https://avatars.dicebear.com/api/male/username.svg"}
                    />
                  </MenuButton>
                  <MenuList alignItems={"center"}>
                    <br />
                    <Center>
                      <Avatar
                        size={"2xl"}
                        src={
                          "https://avatars.dicebear.com/api/male/username.svg"
                        }
                      />
                    </Center>
                    <br />
                    <Center>
                      <p>{username}</p>
                    </Center>
                    <br />
                    <MenuDivider />
                    <MenuItem>Profile</MenuItem>
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
