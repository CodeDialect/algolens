import {
  Heading,
  Text,
  Stack,
  Button,
  Link,
  Badge,
  useColorModeValue,
  Flex,
  Image,
} from "@chakra-ui/react";
import Post from "../component/Post";
import TweetModal from "../component/Inputmodal";
import { PeraWalletConnect } from "@perawallet/connect";

interface ProfileProps {
  username: string;
  accountAddress: string | null;
  peraWallet: PeraWalletConnect;
}

const ProfilePage = ({ username, accountAddress, peraWallet } : ProfileProps) => {

  return (
    <Flex
      h={"100vh"}
      backgroundImage={"linear-gradient(195deg, rgb(0 0 0), rgb(88 26 232))"}
    >
      <TweetModal username={username} senderAddress={accountAddress} peraWallet={peraWallet}/>
      <Flex
        direction={"column"}
        w={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
      >
        <Stack
          borderWidth="1px"
          borderRadius="lg"
          w={"80%"}
          m={"20px 20px 0px 20px"}
          height={{ sm: "476px", md: "20rem" }}
          direction={{ base: "column", md: "row" }}
          bg={useColorModeValue("white", "gray.900")}
          boxShadow={"2xl"}
          padding={4}
        >
          <Flex flex={1} bg="blue.200">
            <Image objectFit="cover" boxSize="100%" src={""} />
          </Flex>
          <Stack
            flex={1}
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            p={1}
            pt={2}
          >
            <Heading fontSize={"2xl"} fontFamily={"body"}>
              Lindsey James
            </Heading>
            <Text fontWeight={600} color={"gray.500"} size="sm" mb={4}>
              {`@${username}` }
            </Text>
            <Text
              textAlign={"center"}
              color={useColorModeValue("gray.700", "gray.400")}
              px={3}
            >
              Actress, musician, songwriter and artist. PM for work inquires or
              <Link href={"#"} color={"blue.400"}>
                #tag
              </Link>
              me in your posts
            </Text>
            <Stack align={"center"} justify={"center"} direction={"row"} mt={6}>
              <Badge
                px={2}
                py={1}
                bg={useColorModeValue("gray.50", "gray.800")}
                fontWeight={"400"}
              >
                #art
              </Badge>
              <Badge
                px={2}
                py={1}
                bg={useColorModeValue("gray.50", "gray.800")}
                fontWeight={"400"}
              >
                #photography
              </Badge>
              <Badge
                px={2}
                py={1}
                bg={useColorModeValue("gray.50", "gray.800")}
                fontWeight={"400"}
              >
                #music
              </Badge>
            </Stack>

            <Stack
              width={"100%"}
              mt={"2rem"}
              direction={"row"}
              padding={2}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Button
                flex={1}
                fontSize={"sm"}
                rounded={"full"}
                bg={"blue.400"}
                color={"white"}
                boxShadow={
                  "0px 1px 25px -5px rgb(66 153 225 / 48%), 0 10px 10px -5px rgb(66 153 225 / 43%)"
                }
                _hover={{
                  bg: "blue.500",
                }}
                _focus={{
                  bg: "blue.500",
                }}
              >
                Follow
              </Button>
            </Stack>
          </Stack>
        </Stack>
        <Stack
          overflow={"auto"}
          m={"0 0 0 0"}
          maxHeight={"calc(100vh - 400px)"}
          width={"100%"}
          display="flex"
          justifyContent="center"
          alignItems={"center"}
          >
          <div
            style={{
              overflowY: "scroll",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <Post />
            <Post />
          </div>
        </Stack>
      </Flex>
    </Flex>
  );
};
export default ProfilePage;
