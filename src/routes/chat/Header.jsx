import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { APIService } from "../../shared/lib/api";
import menu from "@icon/chat/menu.svg";
import exit from "@icon/chat/exit.svg";

export default function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [chatList, setChatList] = useState([]);

  const conversationId = 3;
  const userId = 1;

  useEffect(() => {
    async function fetchChatList() {
      try {
        const res = await APIService.private.get(
          `/chatbot/conversations/${conversationId}?userId=${userId}`
        );

        if (res?.data?.messages) {
          setChatList(res.data.messages);
        }
        console.log("chatList:", res.data.messages);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      }
    }

    fetchChatList();
  }, [conversationId, userId]);

  const handleMenuClick = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <Wrapper>
      <IconWrapper>
        <img
          src={isMenuOpen ? exit : menu}
          alt={isMenuOpen ? "닫기" : "메뉴"}
          onClick={handleMenuClick}
        />
      </IconWrapper>

      {isMenuOpen && <Overlay onClick={handleMenuClick} />}

      <MenuBar $open={isMenuOpen}>
        <Title>채팅 히스토리</Title>
        {chatList.map((chat) => (
          <ChatItem
            key={chat.id}
            onClick={() => {
              navigate(`/chat/${chat.id}`);
              setIsMenuOpen(false);
            }}
          >
            {chat.content}
          </ChatItem>
        ))}
      </MenuBar>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  width: 95%;
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 12px;

  img {
    cursor: pointer;
    z-index: 11;
    transition: all 0.2s ease-in-out;
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9;
`;

const MenuBar = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 250px;
  min-height: 800px;
  background: #fff;
  padding: 16px;
  z-index: 10;

  transform: translateX(${(props) => (props.$open ? "0" : "100%")});
  transition: transform 0.3s ease-in-out;
`;

const Title = styled.p`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
`;

const ChatItem = styled.div`
  padding: 10px 14px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
`;
