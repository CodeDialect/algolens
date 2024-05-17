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
import { useState } from "react";

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
}

const Post: React.FC<PostProps> = ({ postData, width }) => {
  const [isLiked, setIsLiked] = useState(false);
  console.log("postData: ", postData);
  const handleLike = () => {
    setIsLiked(!isLiked);
  };
  return (
    <>
      {postData.map((post, index) => (
        <Card
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
            <Button
              transition="all 0.3s ease-in-out"
              _active={{ transform: "scale(0.9)", color: "blue.500" }}
              onClick={handleLike}
              colorScheme={isLiked ? "blue" : undefined}
              data-type="Button"
              mr="2"
              flex="1"
              leftIcon={
                <StarIcon color={isLiked ? "yellow.500" : "gray.500"} />
              }
            >
              Like
            </Button>
            <Button data-type="Button" flex="1" leftIcon={<LinkIcon />}>
              Share
            </Button>
            <Flex alignItems="center" color="gray.500" ml={"10px"}>
              <StarIcon boxSize={5} />
              <Text ml={1}>{post.likes} Likes</Text>
            </Flex>
          </CardFooter>
        </Card>
      ))}
      {console.log("postData in post", postData)}
    </>
  );
};

export default Post;
