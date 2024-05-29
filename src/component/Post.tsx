import { LinkIcon } from "@chakra-ui/icons";
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
  Spinner,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { PostData, updatePostBy, UserData } from "../utils/fetchData";

interface PostProps {
  postData: PostData[] | undefined;
  width?: string;
  userData: UserData[] | undefined;
}

const Post: React.FC<PostProps> = ({ postData, width, userData }) => {
  const [resultData, setResultData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
    };

    fetchPostData();
  }, [postData, updatePostBy]);
  // const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});

  if (loading)
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
  return (
    <>
      {postData &&
        postData.map((post, index) => {
          const result: string = resultData[index];
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
                        {result}
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
