import { StarIcon, LinkIcon } from "@chakra-ui/icons";
import {
  Box,
  Card,
  Text,
  CardHeader,
  Flex,
  Avatar,
  Heading,
  CardBody,
  CardFooter,
  Button,
} from "@chakra-ui/react";
import { PeraWalletConnect } from "@perawallet/connect";
import { useEffect, useState } from "react";
// import { Like } from "../utils/like";
import { PostData, updatePostBy, UserData } from "../utils/fetchData";

interface PostProps {
  postData: PostData[] | undefined;
  width?: string;
  username: string;
  accountAddress: string | null;
  peraWallet: PeraWalletConnect;
  userData?: UserData[] | undefined;
}

const Post: React.FC<PostProps> = ({ postData, width, userData }) => {
  const [resultData, setResultData] = useState<any[]>([]);
  useEffect(() => {
    const fetchPostData = async () => {
      if (postData) {
        const resultArray = [];
        for (const post of postData) {
          const result = await updatePostBy(Number(post.postBy));
          resultArray.push(result);
        }
        setResultData(resultArray); 
      }
    };

    fetchPostData();
  }, [postData, updatePostBy]);
  // const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});

  // const handleLike = async (
  //   index: number,
  //   username: string,
  //   accountAddress: string | null,
  //   peraWallet: PeraWalletConnect,
  //   postBy: string | undefined
  // ) => {
  //   await Like(username, accountAddress, peraWallet, postBy);

  //   setLikedPosts((prevLikedPosts) => ({
  //     ...prevLikedPosts,
  //     [index]: !prevLikedPosts[index],
  //   }));
  // };

  return (
    <>
      {postData &&
        postData.map((post, index) => {
          const result:string = resultData[index];
          return (
            <Card
              background={"linear-gradient(45deg, rgb(167 143 221), #6b46fe)"}
              key={index}
              m={"10px 50px 50px 50px"}
              data-type="Card"
              w={width ? width : "80vw"}
              height="fit-content"
            >
              <CardHeader data-type="CardHeader">
                <Flex data-type="Flex">
                  <Flex
                    data-type="Flex"
                    flex="1"
                    gap="4"
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <Avatar
                      src={userData && userData[0].profilePicture}
                      data-type="Avatar"
                    ></Avatar>
                    <Box data-type="Box">
                      <Heading data-type="Heading" size="sm">
                      {result ? result : post.postBy}
                      </Heading>
                      <Text data-type="Text">
                        {post.timestamp.toLocaleString()}
                      </Text>
                    </Box>
                  </Flex>
                </Flex>
              </CardHeader>
              <CardBody data-type="CardBody">
                <Text data-type="Text">{post.post}</Text>
              </CardBody>
              <CardFooter
                data-type="CardFooter"
                justify="space-between"
                flexWrap="wrap"
              >
                <Button data-type="Button" flex="1" leftIcon={<LinkIcon />}>
                  Share
                </Button>
                <Flex alignItems="center" color="black" ml={"10px"}></Flex>
              </CardFooter>
            </Card>
          );
        })}
    </>
  );
};

export default Post;
