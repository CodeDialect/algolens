import { Stack, Flex, Spinner } from "@chakra-ui/react";
import TwitterSidebar from "../component/Sidebar";
import Post from "../component/Post";
import { PeraWalletConnect } from "@perawallet/connect";
import { PostData, UserData } from "../utils/fetchData";
import TweetModal from "../component/Inputmodal";
import { useState } from "react";
interface Props {
  username: string;
  peraWallet: PeraWalletConnect;
  accountAddress: string;
  userData: UserData[] | undefined;
  postsData: PostData[] | undefined;
}

export const Home = ({
  peraWallet,
  accountAddress,
  userData,
  postsData,
}: Props) => {
  return (
    <Flex
      backgroundImage={"linear-gradient(195deg, rgb(0 0 0), rgb(88 26 232))"}
    >
      <TwitterSidebar userData={userData} />
      <TweetModal senderAddress={accountAddress} peraWallet={peraWallet} />
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
          <Post postData={postsData} userData={userData} width="90%" />
        </div>
      </Stack>
    </Flex>
  );
};
