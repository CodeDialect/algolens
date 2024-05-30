import { Stack, Flex, Spinner, Box } from "@chakra-ui/react";
import TwitterSidebar from "../component/Sidebar";
import Post from "../component/Post";
import { PeraWalletConnect } from "@perawallet/connect";
import { PostData, UserData } from "../utils/fetchData";
import TweetModal from "../component/Inputmodal";
import { useEffect, useState } from "react";
import RotatingSvgComponent from "../component/loading";
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
  if (userData === undefined) {
    return (
      <Flex justifyContent="center" alignItems="center" height="100vh">
        <Box width="100px" height="100px">
          <RotatingSvgComponent />
        </Box>
      </Flex>
    );
  }
  return (
    <Flex
      backgroundImage={"linear-gradient(195deg, rgb(0 0 0), rgb(88 26 232))"}
    >
      {window.innerWidth > 700 && <TwitterSidebar userData={userData} />}
      <TweetModal
        userProfile={
          userData && userData[0] && userData[0].profilePicture
            ? userData[0].profilePicture
            : ""
        }
        senderAddress={accountAddress}
        peraWallet={peraWallet}
      />
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
