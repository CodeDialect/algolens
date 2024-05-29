import {
  Heading,
  Text,
  Stack,
  Badge,
  useColorModeValue,
  Flex,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import Post from "../component/Post";
import TweetModal from "../component/Inputmodal";
import { PeraWalletConnect } from "@perawallet/connect";
import { useEffect, useState } from "react";
// import { fetchData } from "../database/fetch";
import { indexerClient } from "../utils/constants";
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
  const toast = useToast();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const clientID = "37be49d89f76ade";
    const fileInput = event.target;

    if (fileInput.files && fileInput.files.length > 0) {
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
          uploadedImageURL,
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
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("No file selected");
    }
  };

  return (
    <Flex
      h={"100vh"}
      backgroundImage={"linear-gradient(195deg, rgb(0 0 0), rgb(88 26 232))"}
    >
      <TweetModal
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
            {userData && userData.length > 0 && userData[0]?.profilePicture && (
              <img
                src={userData[0].profilePicture}
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
            <Post
              postData={postData}
              userData={userData}
            />
          </div>
        </Stack>
      </Flex>
    </Flex>
  );
};
export default ProfilePage;
