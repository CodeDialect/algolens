import { Stack, Flex } from "@chakra-ui/react";
import TwitterSidebar from "../component/Sidebar";
import Post from "../component/Post";
import { useState, useEffect } from "react";
import { PostData, fetchAndProcessPosts } from "../utils/fetchposts";
import { PeraWalletConnect } from "@perawallet/connect";

interface Props {
  username: string;
  peraWallet: PeraWalletConnect;
  accountAddress: string | null;
}

export const Home = ({ username, peraWallet, accountAddress }: Props) => {
  const [postData, setPostData] = useState<PostData[]>([]);

  const handlePosts = async () => {
    await fetchAndProcessPosts(setPostData, username, false);
  };

  useEffect(() => {
    const fetchData = async () => {
      await handlePosts();
    };

    fetchData();
  }, [fetchAndProcessPosts, setPostData, username]);

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
          <Post
            username={username}
            accountAddress={accountAddress}
            peraWallet={peraWallet}
            postData={postData}
            width="90%"
          />
        </div>
      </Stack>
    </Flex>
  );
};
