import { Stack, Flex } from "@chakra-ui/react";
import TwitterSidebar from "../component/Sidebar";
import Post from "../component/Post";
import { useState } from "react";
import { PeraWalletConnect } from "@perawallet/connect";
import {
  PostData,
  UserData,
} from "../utils/fetchData";
interface Props {
  username: string;
  peraWallet: PeraWalletConnect;
  accountAddress: string;
  userData: UserData[] | undefined;
  postsData: PostData[] | undefined;
}

export const Home = ({ username, peraWallet, accountAddress, userData, postsData }: Props) => {
  return (
    <Flex
      backgroundImage={"linear-gradient(195deg, rgb(0 0 0), rgb(88 26 232))"}
    >
      <TwitterSidebar accountAddress={accountAddress} username={username} />
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
            postData={postsData}
            userData={userData}
            width="90%"
          />
        </div>
      </Stack>
    </Flex>
  );
};
