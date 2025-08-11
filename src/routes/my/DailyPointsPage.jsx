import useHeader from "../../shared/hooks/useHeader";
import { useQuery } from "@tanstack/react-query";
// import { APIService } from "../../shared/lib/api";
import { useNavigate } from "react-router-dom";
import {
  DailyPointsPageWrapper,
  IconDiv,
  ItemIcon,
  QuestionBox,
  QTextStrong,
  OptionBox,
  OptionCard,
  EmojiIcon,
  OptionLabel,
  SelectBtn,
  SelectTxt,
  BottomTextBox,
  BottomText,
  Point,
  SkeletonCircle,
  SkeletonCard,
  SkeletonLine,
} from "./DailyPointsPage.styles";

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
