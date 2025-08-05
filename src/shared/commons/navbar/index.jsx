import styled from "styled-components";
import NavItem from "./NavItem";

import HomeIcon from "@icon/home.svg";
import HomeActive from "@icon/home_active.svg";
import MapIcon from "@icon/map.svg";
import MapActive from "@icon/map_active.svg";
import SearchIcon from "@icon/search.svg";
import SearchActive from "@icon/search_active.svg";
import ChatIcon from "@icon/chat.svg";
import ChatActive from "@icon/chat_active.svg";
import MyIcon from "@icon/my.svg";
import MyActive from "@icon/my_active.svg";

export default function NavBar() {
  return (
    <NavBarWrapper>
      <NavItem icon={HomeIcon} activeIcon={HomeActive} to="/" label={"홈"} />
      <NavItem icon={MapIcon} activeIcon={MapActive} to="/map" label={"동네"} />
      <NavItem icon={SearchIcon} activeIcon={SearchActive} to="/search" label={"PICK"} />
      <NavItem icon={ChatIcon} activeIcon={ChatActive} to="/chat" label={"피클이"} />
      <NavItem icon={MyIcon} activeIcon={MyActive} to="/my" label={"마이"} />
    </NavBarWrapper>
  );
}

const NavBarWrapper = styled.nav`
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 60px;
  background-color: white;
  display: flex;
  z-index: 1000;
`;
