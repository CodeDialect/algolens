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
} from "@chakra-ui/react";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);

  const handleSignupClick = () => {
    setIsSignup(!isSignup);
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
        <Image src="/logo.png" alt="Logo" width="100%" height="auto" mb={4}/>
        <Stack spacing={4} mb={4}>
          <FormControl>
            <FormLabel>Username</FormLabel>
            <Input type="username" />
          </FormControl>
        </Stack>
        <Button
          _hover={{
            transform: "scale(1.05)",
            transition: "transform 0.3s ease-in-out",
          }}
          color={"white"}
          backgroundImage={"linear-gradient(195deg, rgb(0 0 0), rgb(88 26 232))"}
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