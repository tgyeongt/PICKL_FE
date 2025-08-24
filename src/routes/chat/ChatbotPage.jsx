import styled from "styled-components";
import useHeader from "../../shared/hooks/useHeader";
import useChatbot from "../../shared/hooks/useChatbot";
import Arrow from "@icon/chat/arrow.svg";

export default function ChatbotPage() {
  useHeader({
    title: "피클이와 대화중",
    showBack: true,
  });

  const { messages, searchText, setSearchText, handleSearch, isStreaming, messagesEndRef } =
    useChatbot();

  const TypingIndicator = () => {
    return (
      <TypingDots>
        <span></span>
        <span></span>
        <span></span>
      </TypingDots>
    );
  };

  return (
    <Wrapper>
      <MessageList>
        {messages.map((m, i) => (
          <Message key={i} $role={m.role}>
            {m.text}
            {m.role === "assistant" && !m.text && isStreaming && <TypingIndicator />}
          </Message>
        ))}
        <div ref={messagesEndRef} />
      </MessageList>
      <SearchBox>
        <input
          type="text"
          placeholder="피클이에게 궁금한 걸 물어보세요!"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button onClick={() => handleSearch()} disabled={isStreaming}>
          <img src={Arrow} alt="" />
        </button>
      </SearchBox>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MessageList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 480px;
  padding: 80px 15px 90px;
  box-sizing: border-box;
`;

const Message = styled.div`
  align-self: ${(props) => (props.$role === "user" ? "flex-end" : "flex-start")};
  background: ${(props) => (props.$role === "user" ? "#38b628" : "#eaeaed")};
  color: ${(props) => (props.$role === "user" ? "#fff" : "#1c1b1a")};
  padding: 10px 12px;
  border-radius: 12px;
  max-width: 85%;
  white-space: pre-line;
`;

const SearchBox = styled.div`
  position: fixed;
  bottom: 20px;
  display: flex;
  gap: 8px;
  width: 90%;
  height: 50px;
  max-width: 400px;
  border: 1px solid #ccc;
  border-radius: 30px;
  padding: 5px;
  background: white;
  transition: bottom 0.3s ease;

  input {
    flex: 1;
    padding: 10px 15px;
    font-size: 14px;
  }

  button {
    height: 40px;
    width: 40px;
    cursor: pointer;
  }
`;

const TypingDots = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
  margin-top: 4px;

  span {
    width: 6px;
    height: 6px;
    background-color: #999;
    border-radius: 50%;
    display: inline-block;
    animation: blink 1.4s infinite both;
  }

  span:nth-child(2) {
    animation-delay: 0.2s;
  }
  span:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes blink {
    0% {
      opacity: 0.2;
    }
    20% {
      opacity: 1;
    }
    100% {
      opacity: 0.2;
    }
  }
`;
