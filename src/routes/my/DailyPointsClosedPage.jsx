import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import handIcon from "@icon/my/twoHands.svg";

export default function DailyPointsClosedPage() {
  const navigate = useNavigate();

  return (
    <ClosedWrapper>
      <Emoji
        src={handIcon}
        alt=""
        style={{
          animation: "pulse 3s ease-in-out infinite",
        }}
      />
      <TitleBox>
        <Title>오늘의 퀴즈는 마감되었어요</Title>
        <Title>내일 만나요!</Title>
      </TitleBox>
      <Buttons>
        <PrimaryBtn onClick={() => navigate("/my/points-convert")}>포인트 전환하러 가기</PrimaryBtn>
        <GhostBtn onClick={() => navigate("/", { replace: true })}>홈으로 돌아가기</GhostBtn>
      </Buttons>

      <CloseBtn onClick={() => navigate(-1)}>닫기 ×</CloseBtn>

      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
        `}
      </style>
    </ClosedWrapper>
  );
}

const ClosedWrapper = styled.div`
  min-height: 100dvh;
  width: 100%;
  padding: 0 20px 40px;
  background: linear-gradient(180deg, #010101 0%, #a1a3bd 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow-x: hidden;
`;

const Emoji = styled.img`
  width: 182px;
  height: 182px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
  margin-bottom: 22px;
  margin-top: 121px;
`;

const TitleBox = styled.div`
  margin-bottom: 159px;
`;

const Title = styled.p`
  color: #fff;
  text-align: center;
  font-family: Pretendard;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 40px;
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 357px;
`;

const PrimaryBtn = styled.button`
  height: 56px;
  border: none;
  border-radius: 16px;
  background-color: #f0f0f1;
  color: #1a1a1a;
  font-weight: 700;
  cursor: pointer;
  color: var(--BLACK, #1a1a1a);

  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
`;

const GhostBtn = styled.button`
  height: 56px;
  border-radius: 16px;
  border: none;
  background: #1a1a1a;
  color: #fff;

  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  cursor: pointer;
`;

const CloseBtn = styled.button`
  margin-top: 23px;
  border: none;
  background: transparent;
  color: #4a4b57;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  cursor: pointer;
`;
