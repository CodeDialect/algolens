import { DeleteIcon } from "@chakra-ui/icons";
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
  useToast,
  Link,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { PostData, updatePostBy, UserData } from "../utils/fetchData";
import { deletePost } from "../utils/deletePost";
import { PeraWalletConnect } from "@perawallet/connect";
import DeleteConfirmation from "./Deletemodal";

interface PostProps {
  postData: PostData[] | undefined;
  width?: string;
  userData: UserData[] | undefined;
  peraWallet: PeraWalletConnect;
  accountAddress: string | null;
}

const Post: React.FC<PostProps> = ({
  postData,
  width,
  userData,
  peraWallet,
  accountAddress,
}) => {
  const [resultData, setResultData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hoveredPostIndex, setHoveredPostIndex] = useState<number | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [postId, setPostId] = useState<number | null>(null);

  const toast = useToast();
  const handleMouseEnter = (index: number) => {
    setHoveredPostIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredPostIndex(null);
  };

  const handleDelete = (postid: number) => {
    setIsDeleteConfirmationOpen(true);
    setPostId(postid);
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmationOpen(false);
  };

  const handleDeleteConfirmation = () => {
    handleDeletePost(postId);
    setIsDeleteConfirmationOpen(false);
  };


  const handleDeletePost = async (postId: number | null) => {
    try {
      setIsDeleting(true);
      const result = await deletePost(accountAddress, postId, peraWallet);
      if (result.success) {
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
          description: result.error,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      setPostId(null);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };
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
  }, [postData]);

  if (loading || isDeleting)
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
  if (postData && postData.length === 0 && resultData.length === 0) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Text color={"white"}>No posts found</Text>
      </Flex>
    );
  }
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
              position="relative"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              <Flex justify="flex-end" position="relative">
                <DeleteConfirmation
                  isOpen={isDeleteConfirmationOpen}
                  onClose={handleDeleteCancel}
                  onConfirm={() => handleDeleteConfirmation()}
                />
                {hoveredPostIndex === index &&
                  post.owner === accountAddress && (
                    <Button
                      backgroundColor={"transparent"}
                      data-type="DeleteButton"
                      onClick={() => handleDelete(post.id)} // Replace with your delete logic
                      position="absolute"
                      top="0"
                      right="0"
                      _hover={{ backgroundColor: "transparent" }}
                    >
                      <DeleteIcon color={"red"} />
                    </Button>
                  )}
              </Flex>
              <CardHeader data-type="CardHeader">
                <Flex
                  data-type="Flex"
                  flex="1"
                  gap="4"
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <Link cursor={"default"} href={`/profile`}>
                    <Avatar
                      src={
                        userData && userData[0] && userData[0].profilePicture
                          ? userData[0].profilePicture
                          : ""
                      }
                      data-type="Avatar"
                    ></Avatar>
                  </Link>
                  <Box data-type="Box">
                    <Heading data-type="Heading" size="sm">
                      {result}
                    </Heading>
                    <Text data-type="Text">
                      {post.timestamp.toLocaleString()}
                    </Text>
                  </Box>
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
                <Flex alignItems="center" color="black" ml={"10px"}></Flex>
              </CardFooter>
            </Card>
          );
        })}
    </>
  );
};

export default Post;
