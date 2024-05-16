import {
  Card,
  CardHeader,
  CardBody,
  Text,
  Box,
  Heading,
  Stack,
  Flex,
  Avatar,
  CardFooter,
  Button,
} from "@chakra-ui/react";
import TwitterSidebar from "../component/Sidebar";
import Post from "../component/Post";
export const Home = () => {

  return (
    <Flex
      backgroundImage={"linear-gradient(195deg, rgb(0 0 0), rgb(88 26 232))"}
    >
      <TwitterSidebar />
      <Stack
        m={"0 0 0 0"}
        overflowY="auto"
        maxHeight="calc(100vh - 30px)"
        height={"100vh"}
        width="100%"
      >
        <div
          style={{
            overflowY: "scroll",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <Post />
          <Post />
          <Post />
        </div>
      </Stack>
    </Flex>
  );
};
