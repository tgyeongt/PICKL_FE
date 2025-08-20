import styled from "styled-components";

const ConversationItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;

  &:hover {
    background-color: #fafafa;
  }
`;

const ContentSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const QuestionText = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  line-height: 1.4;
`;

const DateText = styled.div`
  font-size: 14px;
  color: #999999;
  line-height: 1.2;
`;

const MoreButton = styled.div`
  color: #999999;
  font-size: 18px;
  font-weight: bold;
  padding: 4px;
  margin-left: 16px;
`;

export default function ConversationItem({ conversation, onClick }) {
  const handleClick = () => {
    onClick(conversation.id);
  };

  return (
    <ConversationItemContainer onClick={handleClick}>
      <ContentSection>
        <QuestionText>{conversation.title}</QuestionText>
        <DateText>{conversation.createdLabel}</DateText>
      </ContentSection>
      <MoreButton>...</MoreButton>
    </ConversationItemContainer>
  );
}
