import styled from "styled-components";
import { useLocation, useNavigate } from "react-router-dom";

import successP from "@icon/my/pointP.svg";
import upsetFace from "@icon/my/upsetFace.svg";
import orangeIcon from "@icon/my/orangeVector.svg";
import redIcon from "@icon/my/redVector.svg";
import yellowIcon from "@icon/my/yellowVector.svg";
import circleStar from "@icon/my/circleStar.svg";
import realStar from "@icon/my/realStar.svg";
import rectangle from "@icon/my/rectangle.svg";
import starStar from "@icon/my/starStar.svg";
import triangleStar from "@icon/my/triangleStar.svg";

export default function DailyPointsResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // DailyPointsPage에서 넘긴 값: { answer, itemName }
  const answer = state?.answer; // 'up' | 'down'
  const itemName = state?.itemName || "토마토";

  // ⚠️ 임시 판정 로직: 서버 연동 전까지 up이면 성공, down이면 실패로 가정
  // 실제에선 DailyPointsPage에서 서버에 제출 → { isSuccess, rewardPoint } 받아와 state로 넘겨와야 함
  const isSuccess = state?.isSuccess ?? answer === "up";
  const rewardPoint = 100;

  // state 없이 직접 진입한 경우 대비
  if (!answer && state == null) {
    return (
      <DailyPointsResultWrapper>
        <Title>잘못된 접근입니다</Title>
        <Sub>문제 화면에서 다시 선택해 주시길 바랍니다</Sub>
        <PrimaryBtn onClick={() => navigate("/my/points-daily")}>문제로 돌아가기</PrimaryBtn>
      </DailyPointsResultWrapper>
    );
  }

  return (
    <DailyPointsResultWrapper>
      {isSuccess ? (
        <SuccessBox>
          <SmallTag>+{rewardPoint}P</SmallTag>
          <SuccessBigTitle>{rewardPoint}P 획득</SuccessBigTitle>
          <Sub>예측 성공! 포인트가 적립되었어요</Sub>
          <ImgBox>
            <SuccessImage src={successP} alt="" />
            <DecoIcon
              $variant="success"
              src={realStar}
              style={{
                top: "-24px",
                left: "-48px",
                transform: "rotate(-12deg) scale(1.05)",
                opacity: 0.25,
              }}
            />
            <DecoIcon
              $variant="success"
              src={starStar}
              style={{
                top: "-10px",
                right: "-40px",
                transform: "rotate(8deg) scale(0.8)",
                opacity: 0.22,
              }}
            />
            <DecoIcon
              $variant="success"
              src={triangleStar}
              style={{
                top: "80px",
                right: "-28px",
                transform: "rotate(16deg) scale(0.9)",
                opacity: 0.2,
              }}
            />
            <DecoIcon
              $variant="success"
              src={circleStar}
              style={{ top: "96px", left: "-22px", transform: "scale(0.7)", opacity: 0.18 }}
            />
            <DecoIcon
              $variant="success"
              src={rectangle}
              style={{
                bottom: "24px",
                right: "10px",
                transform: "rotate(14deg) scale(0.65)",
                opacity: 0.18,
              }}
            />
            <DecoIcon
              $variant="success"
              src={starStar}
              style={{
                bottom: "8px",
                left: "60px",
                transform: "rotate(-10deg) scale(0.55)",
                opacity: 0.16,
              }}
            />
          </ImgBox>
          <Buttons>
            <GhostBtn onClick={() => navigate("/", { replace: true })}>현재가 보기</GhostBtn>
            <PrimaryBtn onClick={() => alert("광고 SDK 연동 예정")}>
              광고 보고 한 번 더 하기
            </PrimaryBtn>
          </Buttons>
          <CloseBtn onClick={() => navigate(-1)}>닫기 ×</CloseBtn>
        </SuccessBox>
      ) : (
        <FailBox>
          <FailTitleBox>
            <FailTitle>아쉽지만 틀렸어요!</FailTitle>
            <FailTitle>내일 다시 도전해주세요</FailTitle>
          </FailTitleBox>
          <ImgBox>
            <FailImage src={upsetFace} alt="" />
            <DecoIcon
              $variant="fail"
              src={yellowIcon}
              style={{ top: "-40px", left: "50%", transform: "translateX(-50%) rotate(12deg)" }}
            />
            <DecoIcon
              $variant="fail"
              src={redIcon}
              style={{ top: "6px", right: "-26px", transform: "rotate(18deg)" }}
            />
            <DecoIcon
              $variant="fail"
              src={orangeIcon}
              style={{ top: "54px", left: "-36px", transform: "rotate(-12deg)" }}
            />
            <DecoIcon
              $variant="fail"
              src={redIcon}
              style={{ bottom: "86px", left: "-22px", transform: "rotate(8deg)" }}
            />
            <DecoIcon
              $variant="fail"
              src={yellowIcon}
              style={{ bottom: "80px", right: "-20px", transform: "rotate(-8deg)" }}
            />
          </ImgBox>

          <Buttons>
            <GhostBtn onClick={() => navigate("/", { replace: true })}>
              오늘의 {itemName} 가격 보러가기
            </GhostBtn>
            <PrimaryBtn onClick={() => navigate("/", { replace: true })}>
              홈으로 돌아가기
            </PrimaryBtn>
          </Buttons>
          <CloseBtn onClick={() => navigate(-1)}>닫기 ×</CloseBtn>
        </FailBox>
      )}
    </DailyPointsResultWrapper>
  );
}

const DailyPointsResultWrapper = styled.div`
  min-height: 100dvh;
  width: 100%;
  padding: 0 0 40px;
  background: linear-gradient(180deg, #58d848 -6.04%, #fff 73.3%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
`;

const BoxBase = styled.div`
  max-width: 390px;
  width: 100%;
  text-align: center;
  padding: 28px 12px 12px;
  margin: 0 auto;
`;

const SuccessBox = styled(BoxBase)``;
const FailBox = styled(BoxBase)``;

const SmallTag = styled.div`
  display: inline-block;
  padding: 4px 16px;
  border-radius: 20px;
  border-radius: 20px;
  background: #58d848;
  margin-bottom: 18px;
  color: #fff;
  text-align: center;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px;
  margin-top: 70px;
`;

const SuccessBigTitle = styled.p`
  color: #fff;
  text-align: center;
  font-family: Pretendard;
  font-size: 38px;
  font-style: normal;
  font-weight: 800;
  line-height: 46px;
  margin-bottom: 14.3px;
`;

const Title = styled.h3`
  font-size: 22px;
  font-weight: 700;
  color: #1c1b1a;
`;

const Sub = styled.p`
  color: #fff;
  text-align: center;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 26.132px;
  letter-spacing: -0.4px;
  margin-bottom: 26.7px;
`;

const FailTitleBox = styled.div`
  margin-top: 100px;
  margin-bottom: 65px;
`;

const FailTitle = styled.p`
  color: #fff;
  text-align: center;
  font-family: Pretendard;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 40px;
`;

const SuccessImage = styled.img`
  width: 143px;
  height: 152.992px;
  transform: rotate(3.335deg);
  flex-shrink: 0;
  margin: 8px auto 141.95px;
  z-index: 1;
`;

const ImgBox = styled.div`
  position: relative;
  display: inline-block;
`;

const FailImage = styled.img`
  width: 148px;
  height: 148px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
  margin: 8px auto 115px;
`;

const DecoIcon = styled.img`
  position: absolute;
  width: ${({ $variant }) => ($variant === "success" ? "52px" : "15.18px")};
  height: ${({ $variant }) => ($variant === "success" ? "52px" : "15.26px")};
  pointer-events: none;
  z-index: 0;
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 0 10px;
`;

const GhostBtn = styled.button`
  height: 56px;
  border-radius: 12px;
  border: none;
  background: #f0f0f1;
  cursor: pointer;

  color: #1a1a1a;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
`;

const PrimaryBtn = styled.button`
  height: 56px;
  border-radius: 16px;
  border: none;
  background: #1a1a1a;
  color: #fff;
  cursor: pointer;

  color: #fff;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
`;

const CloseBtn = styled.button`
  margin-top: 23px;
  margin-bottom: 40px;
  border: none;
  background: transparent;
  cursor: pointer;

  color: #adadaf;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
`;
