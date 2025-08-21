import styled from "styled-components";

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title = "대화 삭제" }) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <>
      <GlobalStyle />
      <ModalOverlay onClick={onClose}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalTitle>{title}</ModalTitle>
          <ModalMessage>
            이 대화를 삭제하시겠습니까?
            <br />
            삭제된 대화는 복구할 수 없습니다.
          </ModalMessage>
          <ButtonGroup>
            <Button className="cancel" onClick={onClose}>
              취소
            </Button>
            <Button className="delete" onClick={handleConfirm}>
              삭제
            </Button>
          </ButtonGroup>
        </ModalContent>
      </ModalOverlay>
    </>
  );
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  backdrop-filter: blur(8px);
  animation: fadeIn 0.3s ease-out;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 20px;
  padding: 28px;
  max-width: 340px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #ff6b6b, #ff3b30, #ee5a52);
  }
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
`;

const ModalMessage = styled.p`
  font-size: 16px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 24px 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled.button`
  flex: 1;
  padding: 16px 24px;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &.cancel {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    color: #495057;
    border: 1px solid #dee2e6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    &:hover {
      background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }

  &.delete {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 50%, #ff3b30 100%);
    color: white;
    box-shadow: 0 4px 16px rgba(255, 59, 48, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover {
      background: linear-gradient(135deg, #ff5252 0%, #ff3b30 50%, #e0352b 100%);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(255, 59, 48, 0.4);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
    }
  }
`;

// 애니메이션 키프레임
const GlobalStyle = styled.div`
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;
