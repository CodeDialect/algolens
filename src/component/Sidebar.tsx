import { Box, Flex, Text, Link, Icon, Avatar, Tooltip } from "@chakra-ui/react";
import { FiHome, FiHash, FiBell, FiMail } from "react-icons/fi";
import styled from "styled-components";
import { UserData } from "../utils/fetchData";

const StyledSidebar = styled(Box)`
  background: linear-gradient(195deg, rgb(213 196 196), rgb(88 26 232));
  width: 280px;
  border-right: 1px solid #e1e8ed;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
`;

interface SidebarProps {
  userData: UserData[] | undefined;
}

const TwitterSidebar = ({ userData }: SidebarProps) => {
  return (
    <StyledSidebar>
      <Flex
        direction="column"
        alignItems="flex-start"
        width="100%"
        textAlign={"center"}
      >
        <Tooltip label="Home">
          <Link display="flex" href="/" alignItems="center" mb="2">
            <Icon as={FiHome} />
            <Text ml="2">Home</Text>
          </Link>
        </Tooltip>
        <Tooltip label="Coming Soon">
          <Link cursor={"not-allowed"} display="flex" alignItems="center" mb="2">
            <Icon as={FiHash} />
            <Text ml="2">Explore</Text>
          </Link>
        </Tooltip>
        <Tooltip label="Coming Soon">
          <Link display="flex" cursor={"not-allowed"} alignItems="center" mb="2">
            <Icon as={FiBell} />
            <Text ml="2">Notifications</Text>
          </Link>
        </Tooltip>
        <Tooltip label="Coming Soon">
          <Link display="flex" cursor={"not-allowed"} alignItems="center" mb="2">
            <Icon as={FiMail} />
            <Text ml="2">Messages</Text>
          </Link>
        </Tooltip>
      </Flex>
      <Flex justifyContent="center" mt="auto" mb="8">
        <Tooltip label="Profile">
          <Link
            href="/profile"
            display="flex"
            alignItems="center"
            style={{ textDecoration: "none" }}
          >
            <Avatar
              size="md"
              _hover={{ cursor: "pointer" }}
              src={userData && userData[0].profilePicture}
            />
          </Link>
        </Tooltip>
      </Flex>
    </StyledSidebar>
  );
};

export default TwitterSidebar;
