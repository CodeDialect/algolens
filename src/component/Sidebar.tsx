import { Box, Flex, Text, Link, Icon, Avatar } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { FiHome, FiHash, FiBell, FiMail } from "react-icons/fi";
import styled from "styled-components";
import { UserData, fetchUsers } from "../utils/fetchUsers";

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
  accountAddress: string | null;
  username: string;
}


const TwitterSidebar = ({ accountAddress, username }: SidebarProps) => {
  const [userData, setUserData] = useState<UserData[]>();
  
  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     const result = await fetchUsers();
  //     if (typeof result === "string") {
  //       setUserData([]);
  //     } else {
  //       setUserData(result);
  //     }
  //   };

  //   fetchUserData();
  // });

  const user =
    userData &&
    userData.find(
      (user) => user.owner === accountAddress && user.username === username
    );
  const profilePicture = user && user.profilePicture ? user.profilePicture : "";

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
        <Link href="/profile" display="flex" alignItems="center" style={{ textDecoration: "none" }}>
          <Avatar size="md" name="User" src={profilePicture}/>
        </Link>
      </Flex>
    </StyledSidebar>
  );
};

export default TwitterSidebar;