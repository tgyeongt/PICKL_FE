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

  // const conversationId = 1;
  // const userId = 1;

  useEffect(() => {
    async function fetchChatList() {
      try {
        const res = await APIService.private.get(`/chatbot/conversations`);
        if (res?.data) {
          setChatList(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
      }
    }

    fetchChatList();
  }, []);

  const handleDeleteChat = async (conversationId) => {
    try {
      const res = await APIService.private.delete(`/chatbot/conversations/${conversationId}`);
      if (res?.success) {
        setChatList((prev) => prev.filter((chat) => chat.id !== conversationId));

        alert("채팅이 삭제 되었습니다." + res.succes);
      }
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 실패: " + (error.response?.data?.message || error.message));
    }
  };

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
            {chat.title}
            <img
              src={exit}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteChat(chat.id);
              }}
              alt="삭제"
            />
          </ChatItem>
        ))}
      </MenuBar>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  width: 100%;
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
  height: 95vh;
  background: #fff;
  padding: 16px;
  z-index: 10;

  overflow-y: auto;

  opacity: ${(props) => (props.$open ? 1 : 0)};
  transform: translateX(${(props) => (props.$open ? "0" : "100%")});
  pointer-events: ${(props) => (props.$open ? "auto" : "none")};

  transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
`;

const Title = styled.p`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
`;

const ChatItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #333;

  img {
    height: 15px;
    width: 15px;
  }
`;
