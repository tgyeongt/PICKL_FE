import { useLocation, useNavigate } from "react-router-dom";
import { APIService } from "../../shared/lib/api";
import { testLoginIfNeeded } from "../../shared/lib/auth";
import {
  DailyPointsResultWrapper,
  SuccessBox,
  FailBox,
  SmallTag,
  SuccessBigTitle,
  Title,
  Sub,
  FailTitleBox,
  FailTitle,
  SuccessImage,
  ImgBox,
  FailImage,
  DecoIcon,
  Buttons,
  GhostBtn,
  PrimaryBtn,
  CloseBtn,
} from "./DailyPointsResultPage.styles";

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

  const payload = state ?? {};
  const result = payload.result ?? payload.status;
  const awarded = payload.awarded ?? payload.points ?? 0;
  const itemName = payload.ingredientName ?? payload.itemName ?? "토마토";

  const handleViewIngredientPrice = async () => {
    try {
      await testLoginIfNeeded();

      // 퀴즈 시스템과 식재료 시스템의 ID가 다를 수 있으므로 항상 이름으로 검색
      const searchRes = await APIService.private.get("/daily-price-change/store/items/search", {
        params: { name: itemName },
      });

      if (searchRes.success && searchRes.data.length > 0) {
        // 검색 결과에서 정확한 이름을 가진 식재료를 찾기
        const exactMatch = searchRes.data.find(
          (item) =>
            item.name === itemName || item.name.includes(itemName) || itemName.includes(item.name)
        );

        if (exactMatch) {
          navigate(`/search/ingredients/${exactMatch.id}`);
        } else {
          // 정확한 매치가 없으면 첫 번째 결과 사용
          navigate(`/search/ingredients/${searchRes.data[0].id}`);
        }
      } else {
        navigate("/search", { state: { searchQuery: itemName } });
      }
    } catch (error) {
      console.error("식재료 검색 실패:", error);
      navigate("/search", { state: { searchQuery: itemName } });
    }
  };

  if (!result) {
    return (
      <DailyPointsResultWrapper>
        <Title>잘못된 접근입니다</Title>
        <Sub>문제 화면에서 다시 선택해 주시길 바랍니다</Sub>
        <PrimaryBtn onClick={() => navigate("/my/points-daily")}>문제로 돌아가기</PrimaryBtn>
      </DailyPointsResultWrapper>
    );
  }

  const isSuccess = result === "CORRECT";

  return (
    <DailyPointsResultWrapper>
      {isSuccess ? (
        <SuccessBox>
          <SmallTag>+{awarded}P</SmallTag>
          <SuccessBigTitle>{awarded}P 획득</SuccessBigTitle>
          <Sub>예측 성공! 포인트가 적립되었어요</Sub>
          <ImgBox>
            <SuccessImage
              src={successP}
              alt=""
              style={{
                animation: "bounce 3s ease-in-out infinite",
              }}
            />
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
            <GhostBtn onClick={() => navigate("/my/points-convert", { replace: true })}>
              포인트 전환하러 가기
            </GhostBtn>
            <PrimaryBtn
              onClick={() =>
                navigate("/my/points-daily/ad", {
                  state: { returnTo: "/my/points-daily" },
                })
              }
            >
              광고 보고 한 번 더 하기
            </PrimaryBtn>
          </Buttons>
          <CloseBtn onClick={() => navigate("/my")}>닫기 ×</CloseBtn>
        </SuccessBox>
      ) : (
        <FailBox>
          <FailTitleBox>
            <FailTitle>아쉽지만 틀렸어요!</FailTitle>
            <FailTitle>내일 다시 도전해주세요</FailTitle>
          </FailTitleBox>
          <ImgBox>
            <FailImage
              src={upsetFace}
              alt=""
              style={{
                animation: "pulse 3s ease-in-out infinite",
              }}
            />
            <DecoIcon
              $variant="fail"
              src={yellowIcon}
              style={{
                top: "-40px",
                left: "50%",
                transform: "translateX(-50%) rotate(12deg)",
                animation: "rotate 4s linear infinite",
              }}
            />
            <DecoIcon
              $variant="fail"
              src={redIcon}
              style={{
                top: "6px",
                right: "-26px",
                transform: "rotate(18deg)",
                animation: "rotate 4s linear infinite reverse",
              }}
            />
            <DecoIcon
              $variant="fail"
              src={orangeIcon}
              style={{
                top: "54px",
                left: "-36px",
                transform: "rotate(-12deg)",
                animation: "rotate 3s linear infinite",
              }}
            />
            <DecoIcon
              $variant="fail"
              src={redIcon}
              style={{
                bottom: "86px",
                left: "-22px",
                transform: "rotate(8deg)",
                animation: "rotate 5s linear infinite reverse",
              }}
            />
            <DecoIcon
              $variant="fail"
              src={yellowIcon}
              style={{
                bottom: "80px",
                right: "-20px",
                transform: "rotate(-8deg)",
                animation: "rotate 3.5s linear infinite",
              }}
            />
          </ImgBox>

          <Buttons>
            <GhostBtn onClick={handleViewIngredientPrice}>오늘의 {itemName} 가격 보러가기</GhostBtn>
            <PrimaryBtn onClick={() => navigate("/", { replace: true })}>
              홈으로 돌아가기
            </PrimaryBtn>
          </Buttons>
          <CloseBtn onClick={() => navigate("/my")}>닫기 ×</CloseBtn>
        </FailBox>
      )}
      <style>
        {`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-10px);
            }
            60% {
              transform: translateY(-5px);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
          
          @keyframes rotate {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </DailyPointsResultWrapper>
  );
}
