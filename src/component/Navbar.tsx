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
  Tooltip,
  Spinner,
} from "@chakra-ui/react";
import { signin } from "../utils/sigin";
import { PeraWalletConnect } from "@perawallet/connect";
import { UserData } from "../utils/fetchData";
import {
  ChevronRightIcon,
  CloseIcon,
  DeleteIcon,
  HamburgerIcon,
} from "@chakra-ui/icons";
import { deleteEntity } from "../utils/deleteEntity";
import { useEffect, useState } from "react";
import DeleteConfirmation from "./Deletemodal";

interface NavProps {
  accountAddress: string;
  username: string;
  handleConnectWalletClick: () => void;
  handleDisconnectWalletClick: () => void;
  peraWallet: PeraWalletConnect;
  userData: UserData[] | undefined;
}

export default function Nav({
  accountAddress,
  handleConnectWalletClick,
  handleDisconnectWalletClick,
  peraWallet,
  username,
  userData,
}: NavProps) {
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [showProfileButton, setShowProfileButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setShowProfileButton(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check on mount

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleDelete = (userId: number) => {
    if (userId === null || userId === undefined) return;
    setIsDeleteConfirmationOpen(true);
    setUserId(userId);
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmationOpen(false);
  };

  const handleDeleteConfirmation = () => {
    handleDeleteUser(userId);
    setIsDeleteConfirmationOpen(false);
  };

  const handleDeleteUser = async (userId: number | null) => {
    try {
      setIsDeleting(true);
      const result = await deleteEntity(accountAddress, userId, peraWallet);
      if (result?.success) {
        toast({
          title: "Success",
          description: result.message,
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: result?.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong please try again",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      setUserId(null);
      localStorage.removeItem("username");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    if (username !== "" && accountAddress) {
      try {
        const result = await signin(accountAddress, peraWallet, "logout");
        if (result === "logged out successfully") {
          toast({
            title: "Success",
            description: result,
            status: "success",
            duration: 9000,
            isClosable: true,
          });
        } else {
          toast({
            title: "Error",
            description: result,
            status: "error",
            duration: 9000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Something went wrong please try again",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
        localStorage.removeItem("username");
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    }
  };

  if (isDeleting || isLoading) {
    return (
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
    );
  }

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
            <Tooltip label="Home">
              <Image maxW={"60%"} src="logotop.png" alt="logo" />
            </Tooltip>
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
              ) : userData !== undefined &&
                userData.length > 0 &&
                userData[0].loginStatus === 1 ? (
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
                      src={userData ? userData[0].profilePicture : ""}
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
                    {showProfileButton && (
                      <>
                        <MenuItem
                          as={Link}
                          href="/profile"
                          icon={<HamburgerIcon />}
                        >
                          Profile
                        </MenuItem>
                        <MenuDivider />
                      </>
                    )}
                    <MenuItem
                      icon={<ChevronRightIcon />}
                      onClick={() => handleLogout()}
                    >
                      Logout
                    </MenuItem>
                    <MenuItem
                      icon={<CloseIcon />}
                      onClick={() => handleDisconnectWalletClick()}
                    >
                      Disconnect Wallet
                    </MenuItem>
                    <MenuItem
                      icon={<DeleteIcon />}
                      onClick={() => handleDelete(userData?.[0]?.id || -1)}
                    >
                      Delete Account
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
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
              )}
              <DeleteConfirmation
                isOpen={isDeleteConfirmationOpen}
                onClose={handleDeleteCancel}
                onConfirm={() => handleDeleteConfirmation()}
                askText="Are you sure you want to delete your account and posts?"
              />
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}
