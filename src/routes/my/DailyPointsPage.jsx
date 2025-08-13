import useHeader from "../../shared/hooks/useHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

import { APIService } from "../../shared/lib/api";
import { testLoginIfNeeded } from "../../shared/lib/auth";

export default function DailyPointsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  useHeader({
    title: "",
    showBack: true,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dailyPoints", "today"],
    queryFn: async () => {
      await testLoginIfNeeded();
      const res = await APIService.private.get("/quiz/daily");
      const raw = res?.data ?? res;

      return {
        itemName: raw?.ingredient?.name ?? "토마토",
        itemIconUrl: raw?.ingredient?.iconUrl ?? "",
        questionLines: raw?.statement
          ? [raw.statement]
          : [`오늘 ${raw?.ingredient?.name ?? "토마토"}의 가격은`, "어제에 비해 올라갔을까요?"],
        options: raw?.options ?? ["O", "X"],
        attempted: !!raw?.attempted,
      };
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  // 정답 제출
  const { mutate: submitAnswer } = useMutation({
    mutationFn: async (answer) => {
      await testLoginIfNeeded();
      const payload = {
        answer,
        idempotencyKey: crypto.randomUUID(),
      };
      const res = await APIService.private.post("/quiz/daily/answer", payload);
      return res?.data ?? res;
    },
    onSuccess: (res) => {
      // 포인트/통계 invalidate
      qc.invalidateQueries({ queryKey: ["me", "stats"] });

      navigate("/my/points-daily/result", {
        state: {
          result: res?.result, // "CORRECT" | "WRONG"
          awarded: res?.awarded ?? 0, // 적립 포인트
          ingredientName: res?.ingredientName || res?.item?.name, // 백엔드 변동 대비
        },
      });
    },
  });

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

  const itemName = data?.itemName ?? "토마토";
  const itemIcon = data?.itemIconUrl || defaultItemIcon;

  const q1 = data?.questionLines?.[0] || `오늘 ${itemName}의 가격은`;
  const q2 =
    data?.questionLines?.[1] ||
    (data?.questionLines?.length > 1 ? data.questionLines[1] : "어제에 비해 올라갔을까요?");

  const handleSelect = (answer) => {
    submitAnswer(answer);
  };

  return (
    <DailyPointsPageWrapper>
      <IconDiv>
        <ItemIcon src={itemIcon} alt={itemName} />
      </IconDiv>

      <QuestionBox>
        <QTextStrong>{q1}</QTextStrong>
        {q2 && <QTextStrong>{q2}</QTextStrong>}
      </QuestionBox>

      <OptionBox>
        <OptionCard $variant="yes">
          <EmojiIcon src={HappyFace} alt="yes" />
          <OptionLabel $variant="yes">맞다</OptionLabel>
          <SelectBtn type="button" $variant="yes" onClick={() => handleSelect("O")}>
            <SelectTxt>선택</SelectTxt>
          </SelectBtn>
        </OptionCard>

        <OptionCard $variant="no">
          <EmojiIcon src={SadFace} alt="no" />
          <OptionLabel $variant="no">아니다</OptionLabel>
          <SelectBtn type="button" $variant="no" onClick={() => handleSelect("X")}>
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
