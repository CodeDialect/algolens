import {
  Heading,
  Text,
  Stack,
  useColorModeValue,
  Flex,
  useToast,
  Spinner,
  Box,
  Tooltip,
} from "@chakra-ui/react";
import Post from "../component/Post";
import TweetModal from "../component/Inputmodal";
import { PeraWalletConnect } from "@perawallet/connect";
import { useState } from "react";
import { updateProfile } from "../utils/updateProfile";
import { PostData, UserData } from "../utils/fetchData";

interface ProfileProps {
  username: string;
  accountAddress: string | null;
  peraWallet: PeraWalletConnect;
  postData: PostData[] | undefined;
  userData: UserData[] | undefined;
}

const ProfilePage = ({
  username,
  accountAddress,
  peraWallet,
  postData,
  userData,
}: ProfileProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const clientID = process.env.REACT_APP_IMGUR_CLIENT_ID;
    const fileInput = event.target;

    if (fileInput.files && fileInput.files.length > 0) {
      setIsLoading(true);
      const file = fileInput.files[0];
      setSelectedImage(file);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", "file");
      formData.append("title", userData![0].username!);
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
        const uploadedImageURL = data.data.link;
        const updateResponse = await updateProfile(
          username,
          accountAddress,
          peraWallet,
          uploadedImageURL
        );
        if (updateResponse.success) {
          toast({
            title: "Success",
            description: "Image uploaded successfully",
            status: "success",
            duration: 9000,
            isClosable: true,
          });
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
          } catch (error) {
            toast({
              title: "Error",
              description: "Something went wrong please try again",
              status: "error",
              duration: 9000,
              isClosable: true,
            });
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
        setSelectedImage(null);
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } else {
      console.log("No file selected");
    }

    if (isLoading) {
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
  };

  const filteredPosts = postData?.filter(
    (post) => post.owner === accountAddress
  );
  const filterPost = filteredPosts?.length ? filteredPosts : undefined;

  return (
    <Flex
      h={"100vh"}
      backgroundImage={"linear-gradient(195deg, rgb(0 0 0), rgb(88 26 232))"}
    >
      <TweetModal
        userProfile={
          userData && userData[0].profilePicture
            ? userData[0].profilePicture
            : ""
        }
        senderAddress={accountAddress}
        peraWallet={peraWallet}
      />
      <Flex
        direction={"column"}
        w={"100%"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Stack
          borderWidth="1px"
          borderRadius="0.5rem 0.5rem 0 0"
          w={"80%"}
          h={"300px"}
          m={"20px 20px 0px 20px"}
          direction={{ base: "column", md: "row" }}
          bg={useColorModeValue("white", "gray.900")}
          boxShadow={"2xl"}
          padding={4}
          overflow={"hidden"}
        >
          <Flex flex={1} position="relative">
            {userData && userData.length > 0 && (
              <Tooltip label="Change Profile Picture">
              <Box
                style={{
                  cursor: "pointer",
                  backgroundSize: "100% 100%",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  width: "100%",
                  height: "100%",
                  backgroundImage: `${userData[0]?.profilePicture ? `url(${userData[0].profilePicture})` : 'url("avatar-default.svg")'}`,
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
              </Tooltip>
            )}
            <input
              type="file"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleFileChange(e)
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
            {userData && userData[0].username && userData.length > 0 && (
              <Heading fontSize={"2xl"} fontFamily={"body"}>
                {userData[0].username.charAt(0).toUpperCase() +
                  userData[0].username.slice(1).toLowerCase()}
              </Heading>
            )}
            {userData && userData.length > 0 && (
              <Text fontWeight={600} color={"gray.500"} size="sm" mb={4}>
                {`@${userData[0].username}`}
              </Text>
            )}
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
            {filterPost && filterPost.length > 0 && (
              <Post
                accountAddress={accountAddress}
                peraWallet={peraWallet}
                postData={filterPost}
                userData={userData}
              />
            )}
          </div>
        </Stack>
      </Flex>
    </Flex>
  );
};
export default ProfilePage;
