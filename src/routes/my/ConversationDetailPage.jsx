import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { APIService } from "../../shared/lib/api";
import useHeader from "../../shared/hooks/useHeader";

export default function ConversationDetailPage() {
  const { conversationId } = useParams();
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useHeader({
    title: conversation?.title || "대화 내용",
    showBack: true,
  });

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setLoading(true);
        const response = await APIService.chatbot.getConversationHistory(conversationId);
        if (response.success) {
          setConversation(response.data);
        } else {
          setError("대화 내용을 불러올 수 없습니다.");
        }
      } catch (err) {
        console.error("Error fetching conversation:", err);
        setError("대화 내용을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      fetchConversation();
    }
  }, [conversationId]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (loading) {
    return (
      <Container>
        <LoadingText>대화 내용을 불러오는 중...</LoadingText>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorText>{error}</ErrorText>
      </Container>
    );
  }

  if (!conversation) {
    return (
      <Container>
        <ErrorText>대화를 찾을 수 없습니다.</ErrorText>
      </Container>
    );
  }

  return (
    <Container>
      {conversation.messages?.map((message) => (
        <MessageContainer key={message.id} isUser={message.role === "USER"}>
          <MessageBubble isUser={message.role === "USER"}>{message.content}</MessageBubble>
          <MessageTime isUser={message.role === "USER"}>
            {formatTime(message.createdAt)}
          </MessageTime>
        </MessageContainer>
      ))}
    </Container>
  );
}

const Container = styled.div`
  padding: 20px;
  min-height: 100vh;
`;

const MessageContainer = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
`;

const MessageBubble = styled.div`
  max-width: 80%;
  min-width: fit-content;
  padding: 12px 16px;
  border-radius: 18px;
  margin-bottom: 12px;
  word-wrap: break-word;
  line-height: 1.4;
  display: inline-block;

  ${(props) =>
    props.isUser
      ? `
    background-color: #58d748;
    color: white;
    align-self: flex-end;
    margin-left: auto;
    text-align: right;
  `
      : `
    background-color: #F0F0F0;
    color: #333333;
    align-self: flex-start;
    text-align: left;
  `}
`;

const MessageTime = styled.div`
  font-size: 12px;
  color: #999999;
  margin-top: 4px;
  text-align: ${(props) => (props.isUser ? "right" : "left")};
`;

const LoadingText = styled.div`
  text-align: center;
  color: #999999;
  padding: 40px;
`;

const ErrorText = styled.div`
  text-align: center;
  color: #ff3b30;
  padding: 40px;
`;
