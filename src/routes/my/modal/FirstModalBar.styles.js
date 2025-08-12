import styled from "styled-components";

export const FirstModalContainer = styled.div`
  width: 329px;
  height: 219px;
  flex-shrink: 0;
  border-radius: 20px;
  background: #f8f8f8;
`;

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

export const IconSectionWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 25px;
`;

export const GreenCheck = styled.img`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
`;

export const TextSectionWrapper = styled.div`
  margin-top: 12px;
  height: 72px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-items: center;
`;

export const FirstModalText = styled.p`
  color: #000;
  text-align: center;
  font-family: Pretendard;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 32.665px;
  letter-spacing: -0.5px;
`;

export const ButtonSectionWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 5px;
  gap: 11px;
  align-items: center;
  justify-content: center;
`;

export const Button = styled.button`
  width: 129px;
  padding: 8.845px 17.69px;
  border-radius: 5px;
  background-color: aqua;
  text-align: center;
  font-family: Pretendard;
  font-size: 12.383px;
  font-style: normal;
  font-weight: 400;
  line-height: 17.69px;
  letter-spacing: -0.31px;
  margin-left: 30px;
  margin-right: 30px;

  color: ${({ $value }) => ($value === "true" ? "#FFF" : "#999")};
  border: ${({ $value }) =>
    $value === "true"
      ? "0.884px solid rgba(167, 167, 167, 0.15)"
      : "1.5px solid rgba(227, 227, 227, 0.81)"};
  background-color: ${({ $value }) => ($value === "true" ? "#1A1A1A" : "#F8F8F8")};
`;
