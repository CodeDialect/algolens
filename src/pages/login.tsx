import { useState } from "react";
import {
  Flex,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Stack,
  Image,
  Link,
  FormHelperText,
  Spinner,
} from "@chakra-ui/react";
import { fetchUsers } from "../database/fetch";
import { base64ToUTF8String, utf8ToBase64String } from "../utils/conversion";
import { indexerClient } from "../utils/constants";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignupClick = () => {
    setIsSignup(!isSignup);
  };

  const handleUsernameKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isSignup) {
      checkUsernameAvailability(e.currentTarget.value);
    }
  };

  const checkUsernameAvailability = async (username: string) => {

    if (username.trim() === "") {
      return;
    }

    try {
      setIsLoading(true);
      const appIds = await fetchUsers();
      const getField = (
        fieldName:
          | WithImplicitCoercion<string>
          | { [Symbol.toPrimitive](hint: "string"): string },
        globalState: any[]
      ) => {
        return globalState.find((state) => {
          return state.key === utf8ToBase64String(fieldName);
        });
      };

      await Promise.all(
        appIds.map(async (item: any) => {
          let transactionInfo = await indexerClient
            .lookupApplications(item.appId)
            .includeAll(true)
            .do();

          if (transactionInfo.application.deleted) {
            return null;
          }
          let globalState = transactionInfo.application.params["global-state"];
          let userName = "";
          if (getField("USERNAME", globalState) !== undefined) {
            let field = getField("USERNAME", globalState).value.bytes;
            userName = base64ToUTF8String(field);
          }
          if (userName === username) {
            setIsUsernameAvailable(false);
          } else {
            setIsUsernameAvailable(true);
          }
        })
      );
      setIsLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgImage="url('https://png.pngtree.com/thumb_back/fh260/background/20230713/pngtree-3d-rendered-envelopes-featuring-chat-icons-image_3862596.jpg')"
      bgPosition="center"
      bgRepeat="no-repeat"
      bgSize="cover"
      direction={"column"}
    >
      <Box
        textAlign={"center"}
        color={"white"}
        borderRadius={"10px 10px 0 0"}
        backgroundImage={"linear-gradient(195deg, rgb(0 0 0), rgb(88 26 232))"}
        width="50%"
        maxW={["50%", "30%", "40%"]}
        height="auto"
      >
        <Heading mt={4} mb={4}>
          {isSignup ? "Sign Up" : "Sign In"}
        </Heading>
      </Box>

      <Flex
        width="50%"
        maxW={["50%", "30%", "40%"]}
        direction="column"
        bg="white"
        padding={[4, 6, 8]}
        borderRadius="0px 0px 10px 10px"
        boxShadow="lg"
      >
        <Image src="/logo.png" alt="Logo" width="100%" height="auto" mb={4} />
        <Stack spacing={4} mb={4}>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyUp={handleUsernameKeyUp}
            />
            {isLoading && <Spinner mt={2} />}
            {isSignup &&
              username.trim() !== "" &&
              !isLoading &&
              (isUsernameAvailable ? (
                <FormHelperText color="green">
                  Username is available!
                </FormHelperText>
              ) : (
                <FormHelperText color="red">
                  Username is not available.
                </FormHelperText>
              ))}
          </FormControl>
        </Stack>
        <Button
          _hover={{
            transform: "scale(1.05)",
            transition: "transform 0.3s ease-in-out",
          }}
          color={"white"}
          backgroundImage={
            "linear-gradient(195deg, rgb(0 0 0), rgb(88 26 232))"
          }
          width="full"
          isDisabled={!isUsernameAvailable || isLoading || username.trim() === ""}
        >
          {isSignup ? "Buy Username" : "Sign in"}
        </Button>
        <Text mt={4} textAlign="center">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <Link
                onClick={handleSignupClick}
                color="blue.500"
                fontWeight="medium"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <Link
                onClick={handleSignupClick}
                color="blue.500"
                fontWeight="medium"
              >
                Buy a Username
              </Link>
            </>
          )}
        </Text>
      </Flex>
    </Flex>
  );
}
