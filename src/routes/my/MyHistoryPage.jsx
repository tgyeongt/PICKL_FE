import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import useHeader from "../../shared/hooks/useHeader";
import { chatbotAPI } from "../../shared/hooks/useChatbot";
import ConversationItem from "./ConversationItem";

export default function MyHistoryPage({ onConversationDeleted }) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useHeader({
    title: "AI피클히스토리",
    showBack: true,
  });

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await chatbotAPI.getConversations();
      if (response.success) {
        setConversations(response.data);
      } else {
        setError("대화 목록을 불러올 수 없습니다.");
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("대화 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleConversationClick = (conversationId) => {
    navigate(`/chat/${conversationId}`);
  };

  const handleDeleteConversation = (conversationId) => {
    setConversations((prev) => prev.filter((conv) => conv.id !== conversationId));

    if (onConversationDeleted) {
      onConversationDeleted();
    }
  };

  const handleRetry = () => {
    fetchConversations();
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingText>대화 목록을 불러오는 중...</LoadingText>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorText>{error}</ErrorText>
          <RetryButton onClick={handleRetry}>다시 시도</RetryButton>
        </ErrorContainer>
      </Container>
    );
  }

  if (conversations.length === 0) {
    return (
      <Container>
        <EmptyState>
          <EmptyIcon>💬</EmptyIcon>
          <EmptyText>
            아직 AI 피클과의 대화가 없습니다.
            <br />
            AI 피클과 대화를 시작해보세요!
          </EmptyText>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <ConversationList>
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            onClick={handleConversationClick}
            onDelete={handleDeleteConversation}
          />
        ))}
      </ConversationList>
    </Container>
  );
}

const Container = styled.div`
  min-height: 100vh;
  padding-top: 50px;
  padding-left: 20px;
`;

const ConversationList = styled.div``;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #999999;
`;

const EmptyText = styled.div`
  font-size: 16px;
  color: #999999;
  line-height: 1.4;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 20px;
`;

const LoadingText = styled.div`
  color: #999999;
  font-size: 16px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
`;

const ErrorText = styled.div`
  color: #ff3b30;
  font-size: 16px;
  margin-bottom: 16px;
`;

const RetryButton = styled.button`
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #0056cc;
  }
`;
