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
  Link
} from "@chakra-ui/react";

interface NavProps {
  children: React.ReactNode;
  accountAddress: string | null;
  handleConnectWalletClick: () => void;
  handleDisconnectWalletClick: () => void;
}

export default function Nav({
  children,
  accountAddress,
  handleConnectWalletClick,
  handleDisconnectWalletClick,
}: NavProps) {
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
                      <p>Username</p>
                    </Center>
                    <br />
                    <MenuDivider />
                    <MenuItem>Your Servers</MenuItem>
                    <MenuItem>Account Settings</MenuItem>
                    <MenuItem>Logout</MenuItem>
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
