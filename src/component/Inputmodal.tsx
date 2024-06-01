import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Avatar,
  Textarea,
  Button,
  Flex,
  ModalFooter,
  Image,
  useToast,
  Box,
} from "@chakra-ui/react";
import { post } from "../utils/post";
import { PeraWalletConnect } from "@perawallet/connect";

interface TweetModalProps {
  senderAddress: string | null;
  peraWallet: PeraWalletConnect;
  userProfile: string;
}

const TweetModal = ({
  senderAddress,
  peraWallet,
  userProfile,
}: TweetModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tweet, setTweet] = useState("");
  const [tweetLength, setTweetLength] = useState(0);
  const toast = useToast();

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setTweet("");
    setTweetLength(0);
  };

  const handleTweetChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTweet(event.target.value);
    setTweetLength(event.target.value.length);
  };

  const handleTweetSubmit = async () => {
    setIsLoading(true);

    if (tweet.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a tweet.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    if (tweet.length > 123) {
      toast({
        title: "Error",
        description:
          "Tweet is too long. Please enter a tweet with no more than 123 characters.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await post(senderAddress, peraWallet, tweet);
      handleCloseModal();
      if (response && response === "Post Successfully Created") {
        toast({
          title: "Success",
          description: response,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Error",
          description: response,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while posting.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setTweet("");
      setIsLoading(false);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <>
      <Button
        zIndex={1}
        position="fixed"
        bottom={4}
        right={4}
        borderRadius="full"
        colorScheme="teal"
        size="lg"
        boxShadow="lg"
        width={20}
        height={20}
        _hover={{
          transform: "scale(1.05)",
          transition: "transform 0.3s ease-in-out",
        }}
        color="white"
        backgroundImage="linear-gradient(195deg, rgb(0 0 0), rgb(88 26 232))"
        onClick={() => handleOpenModal()}
      >
        <Image src="icon.svg" filter="invert(100%)" />
      </Button>

      <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Write a Post</ModalHeader>
          <ModalCloseButton isDisabled={isLoading}  />

          <ModalBody>
            <Flex alignItems="center">
              <Avatar mr={2} size="md" src={userProfile} />
              <Textarea
                value={tweet}
                onChange={handleTweetChange}
                placeholder="What's happening?"
                size="lg"
                p={4}
                _placeholder={{
                  color: "gray.500",
                }}
                minH="100px"
                resize="none"
                fontSize="lg"
                color="black"
                maxLength={123}
              />
            </Flex>

            <Box mt={4} display={"flex"} justifyContent="flex-end">
              <Box as="span" fontSize="sm" color="gray.500" mr={2}>
                {tweetLength}/123
              </Box>
            </Box>
          </ModalBody>

          <ModalFooter alignItems={"end"}>
            <Button
              isLoading={isLoading}
              colorScheme="teal"
              onClick={handleTweetSubmit}
              fontSize="sm"
              mt={4}
              // isDisabled={tweet.length > 123}
              _hover={{
                transform: "scale(1.05)",
                transition: "transform 0.3s ease-in-out",
              }}
            >
              Post
            </Button>
            <Button
              isDisabled={isLoading}
              ml={3}
              color={"white"}
              backgroundColor={"red.500"}
              onClick={handleCloseModal}
              fontSize="sm"
              mt={4}
              _hover={{
                transform: "scale(1.05)",
                transition: "transform 0.3s ease-in-out",
              }}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TweetModal;
