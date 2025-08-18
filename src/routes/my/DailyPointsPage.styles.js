import styled from "styled-components";

export const DailyPointsPageWrapper = styled.div`
  padding-top: calc(env(safe-area-inset-top, 0px) + 6px);
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
  width: 100%;
  margin: 0 auto;
  background: #fbfbfb;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
`;

export const IconDiv = styled.div`
  padding-top: 53px;
`;

export const ItemIcon = styled.img`
  width: 147px;
  height: 147px;
  flex-shrink: 0;
  aspect-ratio: 1 / 1;
`;

export const ItemEmoji = styled.span`
  width: 147px;
  height: 147px;
  border: none;
  flex-shrink: 0;
  aspect-ratio: 1/1;
  font-size: 147px;
`;

export const QuestionBox = styled.div`
  margin-top: 5px;
  text-align: center;
`;

export const QTextStrong = styled.p`
  color: #1c1b1a;
  text-align: center;
  font-family: Pretendard;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 40px;
`;

export const OptionBox = styled.div`
  display: flex;
  gap: 13px;
  margin-top: 57px;
  box-sizing: border-box;
  width: 100%;
  max-width: 390px; 
  padding: 0 16px;
  justify-content: center;
  min-width: 0;
`;

export const OptionCard = styled.div`
  box-sizing: border-box;
  width: calc((100% - 13px) / 2);
  max-width: 170px;
  height: 210px;
  border-radius: 30px;
  border: 2px solid
    ${({ $variant }) =>
      $variant === "yes" ? "rgba(228, 41, 56, 0.20)" : "rgba(22, 119, 255, 0.20)"};
  background: ${({ $variant }) => ($variant === "yes" ? "#FEE" : "#E8F3FF")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const EmojiIcon = styled.img`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  aspect-ratio: 1 / 1;
  margin-top: 42px;
  margin-bottom: 7px;
`;

export const OptionLabel = styled.p`
  font-family: Pretendard;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 32px;
  color: ${({ $variant }) => ($variant === "yes" ? "#E42938" : "#1677FF")};
`;

export const SelectBtn = styled.button`
  display: flex;
  width: 45px;
  height: 25px;
  padding: 5px 10px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  border-radius: 30px;
  background: ${({ $variant }) => ($variant === "yes" ? "#E42938" : "#1677FF")};
  cursor: pointer;
  margin-top: 27px;
  margin-bottom: 30px;

  &:hover {
    background: ${({ $variant }) => ($variant === "yes" ? "#c72a37" : "#226bd2")};
  }
`;

export const SelectTxt = styled.p`
  color: #fff;
  text-align: center;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px;
`;

export const BottomTextBox = styled.div`
  margin-top: 36px;
  padding-bottom: 100px;
`;

export const BottomText = styled.p`
  color: #2e2e2e;
  text-align: center;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`;

export const Point = styled.span`
  color: #58d848;
`;

export const SkeletonCircle = styled.div`
  width: 147px;
  height: 147px;
  border-radius: 50%;
  background: #eee;
  margin-top: 63px;
  animation: pulse 1.4s ease-in-out infinite;

  @keyframes pulse {
    0% {
      opacity: 0.8;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 0.8;
    }
  }
`;

export const SkeletonLine = styled.div`
  height: 20px;
  background: #eee;
  border-radius: 8px;
  animation: pulse 1.4s ease-in-out infinite;

  @keyframes pulse {
    0% {
      opacity: 0.8;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 0.8;
    }
  }
`;

export const SkeletonCard = styled.div`
  box-sizing: border-box;
  width: calc((100% - 13px) / 2);
  max-width: 170px;
  height: 210px;
  border-radius: 30px;
  background: #f2f2f2;
  animation: pulse 1.4s ease-in-out infinite;

  @keyframes pulse {
    0% {
      opacity: 0.8;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 0.8;
    }
  }
`;
