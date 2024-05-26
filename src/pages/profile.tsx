import {
  Heading,
  Text,
  Stack,
  Badge,
  useColorModeValue,
  Flex,
  Image,
  Button,
} from "@chakra-ui/react";
import Post from "../component/Post";
import TweetModal from "../component/Inputmodal";
import { PeraWalletConnect } from "@perawallet/connect";
import { useEffect, useState } from "react";
import { fetchData } from "../database/fetch";
import { indexerClient } from "../utils/constants";
import { fetchAndProcessPosts, PostData } from "../utils/fetchposts";
import { fetchUsers, UserData } from "../utils/fetchUsers";
import { utf8ToBase64String } from "../utils/conversion";
import { app, db } from "../database/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "../utils/updateProfile";
import axios from "axios";

interface ProfileProps {
  username: string;
  accountAddress: string | null;
  peraWallet: PeraWalletConnect;
}
console.log("aDGS9ks9upSgS14q5B0LRPkDG8eZjz8iIgl1rJ10ynmBFEPJIhE2rD24LsFX");
const storage = getStorage(app);

const ProfilePage = ({
  username,
  accountAddress,
  peraWallet,
}: ProfileProps) => {
  const [postData, setPostData] = useState<PostData[]>([]);
  const [userData, setUserData] = useState<UserData[]>();
  const [image, setImage] = useState<File | null>(null);
  const [imageURL, setImageURL] = useState("");
  const handlePosts = async () => {
    await fetchAndProcessPosts(setPostData, username, true);
  };

  const fetchImgur = async () => {
    const clientId = "37be49d89f76ade";
    const clientSecret = "dd9c92abc810158281e7411570caf814890f219c";

    const response = async () =>
      await fetch("https://api.imgur.com/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      });

    const data = async () => (await response()).json();
    console.log(await data());
  };

  // const uploadImage = async (image: File) => {
  //   const accessToken = 'c5f860a1a012e6c21a820616398f61747e2ba2f9';

  //   const formData = new FormData();
  //   formData.append('image', await fetch(image).then((response) => response.blob()));
  //   formData.append('type', 'file');
  //   formData.append('title', 'Simple upload');
  //   formData.append('description', 'This is a simple image upload in Imgur');

  //   try {
  //     const response = await fetch('https://api.imgur.com/3/image', {
  //       method: 'POST',
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`,
  //       },
  //       body: formData,
  //     });

  //     if (!response.ok) {
  //       throw new Error('Image upload failed');
  //     }

  //     const data = await response.json();
  //     const imageURL = data.data.link;
  //     console.log(imageURL);
  //     return imageURL;
  //   } catch (error) {
  //     console.error(error);
  //     return null;
  //   }
  // };

  // const uploadImage = async (file: File) => {
  //   const storageRef = ref(storage, "12345678910");
  //   await uploadBytes(storageRef,(file));
  //   const downloadURL = await getDownloadURL(storageRef);

  //   try {
  //     const corsProxy = "https://proxy.cors.sh/";
  //     const response = await axios.post(corsProxy + 'https://tinyurl.com/api-create.php', {
  //       url: downloadURL,
  //       api_key: 'aDGS9ks9upSgS14q5B0LRPkDG8eZjz8iIgl1rJ10ynmBFEPJIhE2rD24LsFX',
  //     });
  //     const shortURL = response.data.url;
  //     console.log(shortURL);
  //     return shortURL;
  //   } catch (error) {
  //     console.error(error);
  //     return downloadURL;
  //   }

  //   return downloadURL;
  // };

  // const handleUpload = async () => {
  //   if (image) {
  //     const imageUrl = await uploadImage(image);
  //     console.log(imageUrl);
  //   }
  // };

  const generateRefreshToken = () => {
    const formdata = new FormData();
    formdata.append("refresh_token", "72422738c9831d8269ff6a1e02ab08bc56e8a8a9");
    formdata.append("client_id", "37be49d89f76ade");
    formdata.append("client_secret", "dd9c92abc810158281e7411570caf814890f219c");
    formdata.append("grant_type", "refresh_token");

  const requestOptions = {
    method: "POST",
    body: formdata,
    // redirect: "follow"
  };

  fetch("https://api.imgur.com/oauth2/token", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.error(error));
  };
  

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const clientID = "37be49d89f76ade";
    const fileInput = event.target;

    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];

      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", "file");
      formData.append("title", "Simple upload");
      formData.append("description", "This is a simple image upload in Imgur");

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
        setImageURL(uploadedImageURL);
        console.log(uploadedImageURL);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.log("No file selected");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await handlePosts();
    };
    const fetchUserData = async () => {
      setUserData(await fetchUsers());
    };

    fetchData();
    fetchUserData();
  }, [
    fetchData,
    indexerClient,
    setPostData,
    fetchUsers,
    setUserData,
    username,
    image,
  ]);

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
          <Flex flex={1} bg="blue.200">
            <Image
              objectFit="cover"
              boxSize="100%"
              src={"https://i.imgur.com/e87lLtM.png"}
            />
            {/* <input type="file" onChange={handleFileChange} /> */}
            <button onClick={() => generateRefreshToken()}>Upload</button>
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
              {username}
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
            <Post
              username={username}
              accountAddress={accountAddress}
              peraWallet={peraWallet}
              postData={postData}
            />
          </div>
        </Stack>
      </Flex>
    </Flex>
  );
};
export default ProfilePage;
