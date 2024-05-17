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
} from "@chakra-ui/react";
import { post } from "../utils/post";
import { PeraWalletConnect } from "@perawallet/connect";

interface TweetModalProps {
  username: string;
  senderAddress: string | null;
  peraWallet: PeraWalletConnect;
}

const TweetModal = ({
  username,
  senderAddress,
  peraWallet,
}: TweetModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tweet, setTweet] = useState("");

  const handleOpenModal = () => {
    console.log("openModal");
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setTweet("");
  };

  const handleTweetChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTweet(event.target.value);
  };

  const handleTweetSubmit = async () => {
    // Handle tweet submission logic here
    await post(username, senderAddress, peraWallet, tweet);
    console.log("Tweet submitted:", tweet);
    handleCloseModal();
  };

  return (
    <>
      <Button
        position="fixed"
        bottom={4}
        right={4}
        borderRadius="full" // Make the button circular
        colorScheme="teal"
        size="lg"
        boxShadow="lg"
        width={20} // Set the width and height to the same value to make the button circular
        height={20}
        _hover={{
          transform: "scale(1.05)",
          transition: "transform 0.3s ease-in-out",
        }}
        color={"white"}
        backgroundImage={"linear-gradient(195deg, rgb(0 0 0), rgb(88 26 232))"}
        onClick={() => handleOpenModal()}
      >
        <Image src="icon.svg" filter="invert(100%)" />
      </Button>

      <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Write a Tweet</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Flex alignItems="center">
              <Avatar
                size="md"
                name="John Doe"
              />
              <Textarea
                value={tweet}
                onChange={handleTweetChange}
                placeholder="What's happening?"
                resize="none"
                border="none"
                fontSize="lg"
                height="10rem"
                ml={3}
              />
            </Flex>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleTweetSubmit}>
              Tweet
            </Button>
            <Button onClick={handleCloseModal}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TweetModal;
