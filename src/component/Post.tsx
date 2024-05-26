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
import { useState } from "react";
import { Like } from "../utils/like";

interface PostData {
  post: string | undefined;
  likes: string;
  time: Date;
  post_by: string | undefined;
  owner_address: string | undefined;
  username: string | undefined;
}

interface PostProps {
  postData: PostData[];
  width?: string;
  username: string;
  accountAddress: string | null;
  peraWallet: PeraWalletConnect;
}

const Post: React.FC<PostProps> = ({
  postData,
  width,
  username,
  accountAddress,
  peraWallet,
}) => {
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
      {postData.map((post, index) => (
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
                <Avatar data-type="Avatar"></Avatar>
                <Box data-type="Box">
                  <Heading data-type="Heading" size="sm">
                    {post.username}
                  </Heading>
                  <Text data-type="Text">{post.time.toLocaleString()}</Text>
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
            <Flex alignItems="center" color="black" ml={"10px"}>
            </Flex>
          </CardFooter>
        </Card>
      ))}
    </>
  );
};

export default Post;
