import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { APIService } from "../../shared/lib/api";
import moreHorizontalIcon from "../../shared/assets/icon/my/more-horizontal.svg";
import DeleteConfirmModal from "./modal/DeleteConfirmModal";

const ConversationItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;

  &:hover {
    background-color: #fafafa;
  }
`;

const ContentSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
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

const MoreButton = styled.button`
  background: none;
  border: none;
  padding: 8px;
  margin-left: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    background-color: #f0f0f0;
  }

  img {
    width: 20px;
    height: 20px;
  }
`;

const OptionsMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 20px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 100px;
  overflow: hidden;
`;

const OptionItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background-color: #f5f5f5;
  }

  &.delete {
    color: #ff3b30;
  }

  img {
    width: 16px;
    height: 16px;
  }
`;

export default function ConversationItem({ conversation, onClick, onDelete }) {
  const [showOptions, setShowOptions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const optionsRef = useRef(null);
  const moreButtonRef = useRef(null);

  const handleContentClick = () => {
    onClick(conversation.id);
  };

  const handleMoreClick = (e) => {
    e.stopPropagation();
    setShowOptions(!showOptions);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
    setShowOptions(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      await APIService.chatbot.deleteConversation(conversation.id);
      onDelete(conversation.id);

      // 히스토리 개수 업데이트를 위한 이벤트 발생
      window.dispatchEvent(new CustomEvent("conversationDeleted"));
    } catch (error) {
      console.error("대화 삭제 실패:", error);
      alert("대화 삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 외부 클릭 시 옵션 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target)
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <ConversationItemContainer>
      <ContentSection onClick={handleContentClick}>
        <QuestionText>{conversation.title}</QuestionText>
        <DateText>{conversation.createdLabel}</DateText>
      </ContentSection>
      <MoreButton ref={moreButtonRef} onClick={handleMoreClick}>
        <img src={moreHorizontalIcon} alt="더보기" />
      </MoreButton>

      {showOptions && (
        <OptionsMenu ref={optionsRef}>
          <OptionItem onClick={handleDeleteClick} className="delete">
            삭제
          </OptionItem>
        </OptionsMenu>
      )}

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="대화 삭제"
      />
    </ConversationItemContainer>
  );
}
