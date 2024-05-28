import {
  Heading,
  Text,
  Stack,
  Badge,
  useColorModeValue,
  Flex,
  useToast,
} from "@chakra-ui/react";
import Post from "../component/Post";
import TweetModal from "../component/Inputmodal";
import { PeraWalletConnect } from "@perawallet/connect";
import { useEffect, useState } from "react";
// import { fetchData } from "../database/fetch";
import { indexerClient } from "../utils/constants";
import { fetchAndProcessPosts, PostData } from "../utils/fetchposts";
import { fetchUsers, UserData } from "../utils/fetchUsers";
import { updateProfile } from "../utils/updateProfile";

interface ProfileProps {
  username: string;
  accountAddress: string | null;
  peraWallet: PeraWalletConnect;
}

const ProfilePage = ({
  username,
  accountAddress,
  peraWallet,
}: ProfileProps) => {
  const [postData, setPostData] = useState<PostData[]>([]);
  const [userData, setUserData] = useState<UserData[]>();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const toast = useToast();

  const handlePosts = async () => {
    try {
      await fetchAndProcessPosts(setPostData, username, true);
    } catch (err) {
      console.log(err);
      toast({
        title: "Error",
        description: "An error occurred while fetching and processing posts.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    appId: number
  ) => {
    const clientID = "37be49d89f76ade";
    const fileInput = event.target;

    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      setSelectedImage(file);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", "file");
      formData.append("title", `${appId}`);
      try {
        const response = await fetch("https://api.imgur.com/3/image", {
          method: "POST",
          headers: new Headers({
            Authorization: `Client-ID ${clientID}`,
          }),
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Image upload failed");
        }

        const data = await response.json();
        console.log(data);
        const uploadedImageURL = data.data.link;
        const updateResponse = await updateProfile(
          username,
          accountAddress,
          peraWallet,
          uploadedImageURL,
          appId
        );
        if (updateResponse.success) {
          toast({
            title: "Success",
            description: "Image uploaded successfully",
            status: "success",
            duration: 9000,
            isClosable: true,
          });
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
        if (updateResponse.error) {
          try {
            await fetch(
              "https://api.imgur.com/3/image/" + data.data.deletehash,
              {
                method: "DELETE",
                headers: new Headers({
                  Authorization: `Client-ID ${clientID}`,
                }),
                body: file,
              }
            );
            toast({
              title: "Error",
              description: "Image upload failed",
              status: "error",
              duration: 9000,
              isClosable: true,
            });
            setTimeout(() => {
              window.location.reload();
            }, 500);
          } catch (error) {
            console.error(error);
          }
        }
        setSelectedImage(null);
        console.log(uploadedImageURL);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("No file selected");
    }
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     await handlePosts();
  //   };
  //   const fetchUserData = async () => {
  //     const result = await fetchUsers();
  //     if (typeof result === "string") {
  //       setUserData([]);
  //       toast({
  //         title: "Error",
  //         description: result,
  //         status: "error",
  //         duration: 9000,
  //         isClosable: true,
  //       })
  //     } else {
  //       setUserData(result);
  //     }
  //   };

  //   fetchData();
  //   fetchUserData();
  // }, [
  //   fetchData,
  //   indexerClient,
  //   setPostData,
  //   fetchUsers,
  //   setUserData,
  //   username,
  // ]);

  const user = (userData ?? []).filter(
    (data) =>
      data.username === username.toLowerCase() && data.owner === accountAddress
  );

  return (
    <Flex
      h={"100vh"}
      backgroundImage={"linear-gradient(195deg, rgb(0 0 0), rgb(88 26 232))"}
    >
      <TweetModal
        username={username}
        senderAddress={accountAddress}
        peraWallet={peraWallet}
      />
      <Flex
        direction={"column"}
        w={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Stack
          borderWidth="1px"
          borderRadius="0.5rem 0.5rem 0 0"
          w={"80%"}
          m={"20px 20px 0px 20px"}
          height={{ sm: "476px", md: "20rem" }}
          direction={{ base: "column", md: "row" }}
          bg={useColorModeValue("white", "gray.900")}
          boxShadow={"2xl"}
          padding={4}
        >
          <Flex flex={1} bg="blue.200" position="relative">
            {user && user[0] && user[0].profilePicture && (
              <img
                src={user[0].profilePicture}
                alt="Selected Image"
                style={{
                  cursor: "pointer",
                  objectFit: "cover",
                  width: "100%",
                  height: "100%",
                }}
                onClick={() => {
                  const fileInput = document.createElement("input");
                  fileInput.type = "file";
                  fileInput.accept = "image/*";
                  fileInput.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      setSelectedImage(file);
                    }
                  };
                  fileInput.click();
                }}
              />
            )}
            <input
              type="file"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFileChange(e, user[0].appId)
              }
              style={{
                display: selectedImage ? "none" : "block",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0,
                cursor: "pointer",
              }}
            />
          </Flex>
          <Stack
            flex={1}
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            p={1}
            pt={2}
          >
            <Heading fontSize={"2xl"} fontFamily={"body"}>
              {username.charAt(0).toUpperCase() +
                username.slice(1).toLowerCase()}
            </Heading>
            <Text fontWeight={600} color={"gray.500"} size="sm" mb={4}>
              {`@${username}`}
            </Text>
            <Text
              textAlign={"center"}
              color={useColorModeValue("gray.700", "gray.400")}
              px={3}
            >
              Actress, musician, songwriter and artist.
            </Text>
            <Stack align={"center"} justify={"center"} direction={"row"} mt={6}>
              <Badge
                px={2}
                py={1}
                bg={useColorModeValue("gray.50", "gray.800")}
                fontWeight={"400"}
              >
                #art
              </Badge>
              <Badge
                px={2}
                py={1}
                bg={useColorModeValue("gray.50", "gray.800")}
                fontWeight={"400"}
              >
                #photography
              </Badge>
              <Badge
                px={2}
                py={1}
                bg={useColorModeValue("gray.50", "gray.800")}
                fontWeight={"400"}
              >
                #music
              </Badge>
            </Stack>
          </Stack>
        </Stack>
        <Stack
          overflow={"auto"}
          m={"0 0 0 0"}
          maxHeight={"calc(100vh - 400px)"}
          width={"100%"}
          display="flex"
          justifyContent="center"
          alignItems={"center"}
        >
          <div
            style={{
              overflowY: "scroll",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            {/* <Post
              username={username}
              accountAddress={accountAddress}
              peraWallet={peraWallet}
              postData={postData}
              userData={userData}
            /> */}
          </div>
        </Stack>
      </Flex>
    </Flex>
  );
};
export default ProfilePage;
