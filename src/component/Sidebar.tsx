import { Box, Flex, Text, Link, Icon, Avatar } from "@chakra-ui/react";
import { FiHome, FiHash, FiBell, FiMail } from "react-icons/fi";
import styled from "styled-components";

const StyledSidebar = styled(Box)`
  background: linear-gradient(195deg, rgb(213 196 196), rgb(88 26 232));
  width: 280px;
  border-right: 1px solid #e1e8ed;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
`;

const TwitterSidebar = () => {
  return (
    <StyledSidebar>
      <Flex direction="column" alignItems="flex-start" width="100%" textAlign={"center"}>
        <Link display="flex" alignItems="center" mb="2">
          <Icon as={FiHome} />
          <Text ml="2">Home</Text>
        </Link>
        <Link display="flex" alignItems="center" mb="2">
          <Icon as={FiHash} />
          <Text ml="2">Explore</Text>
        </Link>
        <Link display="flex" alignItems="center" mb="2">
          <Icon as={FiBell} />
          <Text ml="2">Notifications</Text>
        </Link>
        <Link display="flex" alignItems="center" mb="2">
          <Icon as={FiMail} />
          <Text ml="2">Messages</Text>
        </Link>
      </Flex>
      <Flex justifyContent="center" mt="auto" mb="8">
        <Link display="flex" alignItems="center">
          <Avatar size="md" name="User" />
        </Link>
      </Flex>
    </StyledSidebar>
  );
};

export default TwitterSidebar;