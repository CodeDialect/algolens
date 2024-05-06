import { StarIcon, LinkIcon } from "@chakra-ui/icons";
import {
  Stack,
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


const Post = () => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };
  return (
    // <Stack
    //   m={"0 0 0 0"}
    //   overflowY="auto"
    //   maxHeight="calc(100vh - 30px)"
    //   width="100%"
    // >
      // <div
      //   style={{
      //     minHeight: `${height}`,
      //     overflowY: "scroll",
      //     scrollbarWidth: "none",
      //     msOverflowStyle: "none",
      //     display: "flex",
      //     justifyContent: "center",
      //   }}
      // >
        <Card m={"50px"} data-type="Card" maxW="50rem" height="fit-content">
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
                  data-type="Avatar"
                  name="Segun Adebayo"
                  src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NzF8fHBvcnRyYWl0fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=800&q=60"
                ></Avatar>
                <Box data-type="Box">
                  <Heading data-type="Heading" size="sm">
                    Aloïs Pierre
                  </Heading>
                  <Text data-type="Text">Creator of Studio 23</Text>
                </Box>
              </Flex>
            </Flex>
          </CardHeader>
          <CardBody data-type="CardBody">
            <Text data-type="Text">
              With Chakra UI, I wanted to sync the speed of development with the
              speed of design. I wanted the developer to be just as excited as
              the designer to create a screen.
            </Text>
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
          </CardFooter>
        </Card>
      // </div>
    // </Stack>
  );
};

export default Post;