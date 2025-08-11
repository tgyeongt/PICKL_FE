import styled from "styled-components";

export const OverlayBox = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1500;

  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible }) => ($visible ? "translateY(0)" : "translateY(20px)")};
  transition: opacity 0.3s ease, transform 0.3s ease;
`;

export const SetModalContainer = styled.div`
  width: 329px;
  height: 178px;
  flex-shrink: 0;
  border-radius: 20px;
  background: #f8f8f8;
`;

export const IconSectionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 38px;
  padding-bottom: 17px;
`;

export const CheckIcon = styled.img`
  width: 44px;
  height: 44px;
`;

export const NoteSectionWrapper = styled.div`
  padding: 0 106.5px;
`;

export const NoteText = styled.p`
  color: #000;
  text-align: center;
  font-family: Pretendard;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 32.665px;
  letter-spacing: -0.5px;
`;
