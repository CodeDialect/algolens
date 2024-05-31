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
  const [isUsernameAvailable, setIsUsernameAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const op = "login";
  const toast = useToast();
  const handleSignupClick = () => {
    setIsSignup(!isSignup);
    setUsername("");
    setIsUsernameAvailable(true);
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
    if(username.length > 20) {
      toast({
        title: "Error",
        description: "Username must be less than 20 characters",
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
        description: "Something went wrong" + err, // Corrected variable name
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const handleLogin = async (username: string) => {
    const response = await checkUser(username);
    if (response === "Username is available") {
      toast({
        title: "Error",
        description: "Username not found",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      return;
    }

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
      setIsLoading(true);
      const response = await signin(username, accountAddress, peraWallet, op);

      if (localStorage.getItem("username") === username) {
        toast({
          title: "Success",
          description: "User logged in successfully",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        setIsLoading(false);
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: response,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
      setIsLoading(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "User login failed",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  const handleUsernameKeyUp = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.currentTarget.value.trim() === "") {
      return;
    }

    if (e.currentTarget.value.length < 3) {
      setIsUsernameAvailable(false);
      return;
    }

    if (isSignup) {
      setIsLoading(true);
      const response = await checkUser(e.currentTarget.value);
      if (response === "Username is available") {
        setIsUsernameAvailable(true);
      }
      else{
        setIsUsernameAvailable(false);
      }
      setIsLoading(false);
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
              onKeyUp={handleUsernameKeyUp}
              maxLength={20}
            />
            {isLoading && <Spinner  />}
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
            isSignup
              ? !isUsernameAvailable || isLoading || username.trim() === ""
              : isLoading
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
