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
  useToast,
} from "@chakra-ui/react";
import { createUser } from "../utils/buyUsername";
import { PeraWalletConnect } from "@perawallet/connect";
import { signin } from "../utils/sigin";
import { checkUser } from "../utils/checkUser";

interface LoginProps {
  peraWallet: PeraWalletConnect;
  accountAddress: string | null;
}

export default function LoginPage({ peraWallet, accountAddress }: LoginProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const op = "login";
  const toast = useToast();

  const handleSignupClick = () => {
    setIsSignup(!isSignup);
    setUsername("");
  };

  const handleSignup = async (username: string) => {
    setIsLoading(true);
    const response = await checkUser(username);
    if (response !== "Username is available") {
      toast({
        title: "Error",
        description: response,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      setIsLoading(false);
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
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await createUser(peraWallet, accountAddress, {
        username: username,
      });
      if (response.includes("User created successfully")) {
        toast({
          title: "Success",
          description: response, // Corrected variable name
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: response, // Corrected variable name
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong please try again" + err, // Corrected variable name
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setUsername("");
      handleSignupClick();
    }
  };

  const handleLogin = async (username: string) => {
    setIsLoading(true);
    if (username.trim() === "") {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      setIsLoading(false);
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
      setIsLoading(false);
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
      setIsLoading(false);
      return;
    }

    const response = await checkUser(username, accountAddress);
    if (response === "Username is available") {
      toast({
        title: "Error",
        description: "Username not found",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    if (response === "Username is registered with another address") {
      toast({
        title: "Error",
        description: "Username is registered with another address",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await signin(accountAddress, peraWallet, op);
      if (response && response.includes("logged in successfully")) {
        toast({
          title: "Success",
          description: response,
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: response,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
      // window.location.reload();
    } catch (err) {
      toast({
        title: "Error",
        description: "User login failed",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        // window.location.reload();
      }, 500);
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
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
              maxLength={20}
            />
          </FormControl>
        </Stack>
        <Button
          isLoading={isLoading}
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
              handleSignup(username);
            }
            if (!isSignup) {
              handleLogin(username);
            }
          }}
          width="full"
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
