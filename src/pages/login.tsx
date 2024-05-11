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
  useToast,
} from "@chakra-ui/react";
import { fetchUsers } from "../database/fetch";
import { base64ToUTF8String, utf8ToBase64String } from "../utils/conversion";
import { indexerClient } from "../utils/constants";
import { createUser } from "../utils/buyUsername";
import { PeraWalletConnect } from "@perawallet/connect";
import { signin } from "../utils/sigin";

interface LoginProps {
  peraWallet: PeraWalletConnect;
  accountAddress: string | null;
}

export default function LoginPage({ peraWallet, accountAddress }: LoginProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const op = "login";
  const toast = useToast();
  const handleSignupClick = () => {
    setIsSignup(!isSignup);
  };

  const handleSignup = async (username: string) => {
    if (username.trim() === "") {
      return;
    }

    if (username.length < 3) {
      toast({
        title: "Error",
        description: "Username must be at least 3 characters",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    if (!accountAddress) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    try {
      await createUser(peraWallet, accountAddress, { username: username });
      toast({
        title: "Success",
        description: "User created successfully",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "User creation failed",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const handleLogin = async (username: string) => {
    if (username.trim() === "") {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    if (username.length < 3) {
      toast({
        title: "Error",
        description: "Username must be at least 3 characters",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    if (!accountAddress) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }
    try {
      await signin(username, accountAddress, peraWallet, op);
      toast({
        title: "Success",
        description: "User logged in successfully",
        status: "success",
        duration: 9000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "User login failed",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
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

    if (username.length < 3) {
      setIsUsernameAvailable(false);
      return;
    }
    console.log(username);
    try {
      setIsLoading(true);
      let userNames: string[] = [];
      const appIds = await fetchUsers();
      console.log("appIds", appIds);
      if (appIds.length === 0) {
        setIsUsernameAvailable(true);
        setIsLoading(false);
        return;
      }
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

          if (getField("USERNAME", globalState) !== undefined) {
            let field = getField("USERNAME", globalState).value.bytes;
            userNames.push(base64ToUTF8String(field));
          }
          console.log("userNames", userNames);
          if (userNames.some((name) => name === username)) {
            setIsUsernameAvailable(false);
          } else {
            setIsUsernameAvailable(true);
          }
        })
      );
      setIsLoading(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
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
              value={username.toLowerCase()}
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
          onClick={() => {
            if (isSignup) {
              if (isUsernameAvailable) {
                handleSignup(username);
              }
            }
            if (!isSignup) {
              handleLogin(username);
            }
          }}
          width="full"
          isDisabled={
            !isUsernameAvailable || isLoading || username.trim() === ""
          }
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
