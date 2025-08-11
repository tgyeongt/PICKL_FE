import styled from "styled-components";
import useHeader from "../../shared/hooks/useHeader";
import { useQuery } from "@tanstack/react-query";
// import { APIService } from "../../shared/lib/api";
import { useNavigate } from "react-router-dom";

// 기본 폴백 리소스 (백엔드가 아직 없으니 토마토로 기본 세팅)
import defaultItemIcon from "@icon/my/tomatoIcon.svg";
import HappyFace from "@icon/my/happyFace.svg";
import SadFace from "@icon/my/sadIcon.svg";

export default function DailyPointsPage() {
  const navigate = useNavigate();

  useHeader({
    title: "",
    showBack: true,
  });

  // 오늘의 예측 문제 데이터 불러오기
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dailyPoints", "today"],
    queryFn: async () => {
      // 실제 연동 시 엔드포인트 예시: /daily-points/today
      // const res = await APIService.private.get("/daily-points/today");
      // const raw = res?.data ?? res;

      // 임시 목데이터 (백 나오기 전까지)
      const raw = {
        itemName: "토마토",
        // 없으면 폴백 아이콘 사용
        itemIconUrl: "",
        // 필요 시 서버가 바뀔 수 있도록 문구도 서버 제공 가능
        questionLines: ["오늘 {item}의 가격은", "어제에 비해 올라갔을까요?"],
        // 서버가 정답 판단을 하는 구조라면 여기선 안 씀
      };

      return {
        itemName: raw?.itemName || "토마토",
        itemIconUrl: raw?.itemIconUrl || "",
        questionLines:
          Array.isArray(raw?.questionLines) && raw.questionLines.length > 0
            ? raw.questionLines
            : ["오늘 {item}의 가격은", "어제에 비해 올라갔을까요?"],
      };
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  const itemName = data?.itemName ?? "토마토";
  const itemIcon = data?.itemIconUrl || defaultItemIcon; // 없으면 토마토 아이콘

  const q1 = (data?.questionLines?.[0] || "오늘 {item}의 가격은").replace("{item}", itemName);
  const q2 = data?.questionLines?.[1] || "어제에 비해 올라갔을까요?";

  const handleSelect = (answer /* 'up' | 'down' */) => {
    // 실제로는 서버에 answer 제출 → 결과 판정 응답 받고 페이지 이동 권장
    // 지금은 라우팅만 연결해둘게
    navigate("/my/points-daily/result", { state: { answer, itemName } });
  };

  if (isLoading) {
    return (
      <DailyPointsPageWrapper>
        <SkeletonCircle />
        <QuestionBox style={{ marginTop: 24 }}>
          <SkeletonLine style={{ width: 240 }} />
          <SkeletonLine style={{ width: 280, marginTop: 8 }} />
        </QuestionBox>
        <OptionBox style={{ marginTop: 48 }}>
          <SkeletonCard />
          <SkeletonCard />
        </OptionBox>
      </DailyPointsPageWrapper>
    );
  }

  if (isError) {
    return (
      <DailyPointsPageWrapper>
        <QuestionBox style={{ marginTop: 80 }}>
          <QTextStrong>문제를 불러오지 못했습니다</QTextStrong>
          <p style={{ color: "#787885", marginTop: 8, fontSize: 14 }}>잠시 후 다시 시도해주세요</p>
        </QuestionBox>
      </DailyPointsPageWrapper>
    );
  }

  return (
    <DailyPointsPageWrapper>
      <IconDiv>
        <ItemIcon src={itemIcon} alt={itemName} />
      </IconDiv>

      <QuestionBox>
        <QTextStrong>{q1}</QTextStrong>
        <QTextStrong>{q2}</QTextStrong>
      </QuestionBox>

      <OptionBox>
        <OptionCard $variant="up">
          <EmojiIcon src={HappyFace} alt="up" />
          <OptionLabel $variant="up">올랐다</OptionLabel>
          <SelectBtn type="button" $variant="up" onClick={() => handleSelect("up")}>
            <SelectTxt>선택</SelectTxt>
          </SelectBtn>
        </OptionCard>

        <OptionCard $variant="down">
          <EmojiIcon src={SadFace} alt="down" />
          <OptionLabel $variant="down">떨어졌다</OptionLabel>
          <SelectBtn type="button" $variant="down" onClick={() => handleSelect("down")}>
            <SelectTxt>선택</SelectTxt>
          </SelectBtn>
        </OptionCard>
      </OptionBox>

      <BottomTextBox>
        <BottomText>
          정답시 <Point>100P</Point> 적립
        </BottomText>
      </BottomTextBox>
    </DailyPointsPageWrapper>
  );
}

const DailyPointsPageWrapper = styled.div`
  padding-top: calc(env(safe-area-inset-top, 0px) + 6px);
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
  width: 100%;
  margin: 0 auto;
  background: #fbfbfb;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconDiv = styled.div`
  padding-top: 63px;
`;

const ItemIcon = styled.img`
  width: 147px;
  height: 147px;
  flex-shrink: 0;
  aspect-ratio: 1 / 1;
`;

const QuestionBox = styled.div`
  margin-top: 19px;
  text-align: center;
`;

const QTextStrong = styled.p`
  color: #1c1b1a;
  text-align: center;
  font-family: Pretendard;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 40px;
`;

const OptionBox = styled.div`
  display: flex;
  gap: 13px;
  margin-top: 57px;
  padding: 0;
  width: 100%;
  justify-content: center;
`;

const OptionCard = styled.div`
  width: 170px;
  height: 210px;
  border-radius: 30px;
  border: 2px solid
    ${({ $variant }) => 
      $variant === "up" ? "rgba(228, 41, 56, 0.20)" : "rgba(22, 119, 255, 0.20)"};
  background: ${({ $variant }) => ($variant === "up" ? "#FEE" : "#E8F3FF")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const EmojiIcon = styled.img`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  aspect-ratio: 1 / 1;
  margin-top: 42px;
  margin-bottom: 7px;
`;

const OptionLabel = styled.p`
  font-family: Pretendard;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 32px;
  color: ${({ $variant }) => ($variant === "up" ? "#E42938" : "#1677FF")};
`;

const SelectBtn = styled.button`
  display: flex;
  width: 45px;
  height: 25px;
  padding: 5px 10px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  border-radius: 30px;
  background: ${({ $variant }) => ($variant === "up" ? "#E42938" : "#1677FF")};
  cursor: pointer;
  margin-top: 27px;
  margin-bottom: 30px;

  &:hover {
    background: ${({ $variant }) => ($variant === "up" ? "#c72a37" : "#226bd2")};
  }
`;

const SelectTxt = styled.p`
  color: #fff;
  text-align: center;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px;
`;

const BottomTextBox = styled.div`
  margin-top: 36px;
  padding-bottom: 100px;
`;

const BottomText = styled.p`
  color: #2e2e2e;
  text-align: center;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`;

const Point = styled.span`
  color: #58d848;
`;

/* ---- skeletons ---- */
const SkeletonCircle = styled.div`
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

const SkeletonLine = styled.div`
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

const SkeletonCard = styled.div`
  width: 170px;
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
