import useHeader from "../../shared/hooks/useHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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

// 🔧 옵션: 5xx면 DEV에서만 모의문제로 폴백할지 여부
const DEV_MOCK_ON_5XX = false;
const MOCK_QUIZ = {
  itemName: "토마토",
  itemIconUrl: "",
  questionLines: ["토마토는 과일이다?", "(연동 오류로 모의 문제 표시 중)"],
  attempted: false,
  __fallback: "mock500",
};

// 🔎 공통 에러 파서
function parseApiError(e) {
  const status = e?.response?.status;
  const msg = e?.response?.data?.message || e?.message || "unknown";
  return { status, msg };
}

export default function DailyPointsPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const adWatched = !!state?.adWatched;
  const adNonceFromNav = state?.adNonce;
  const [retryToken, setRetryToken] = useState(null);
  const qc = useQueryClient();

  useHeader({
    title: "",
    showBack: true,
  });

  // 광고에서 돌아왔을 때: 캐시 키 변경 + 즉시 재요청
  useEffect(() => {
    if (adWatched) {
      const token = adNonceFromNav || String(Date.now());
      setRetryToken(token);
      qc.invalidateQueries({ queryKey: ["dailyPoints", "today"] });
      qc.refetchQueries({ queryKey: ["dailyPoints", "today"], type: "active" });
      navigate(".", { replace: true }); // history state 정리
    }
  }, [adWatched, adNonceFromNav, navigate, qc]);

  // 오늘의 문제 조회
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dailyPoints", "today", retryToken],
    queryFn: async () => {
      await testLoginIfNeeded();
      const path = "/quiz/daily";
      const params = {
        _ts: Date.now(), // 캐시버스터
        ...(retryToken ? { retry: 1, nonce: retryToken } : {}),
      };

      try {
        const res = await APIService.private.get(path, { params });

        const raw = res ?? {};

        const lines = Array.isArray(raw?.questionLines)
          ? raw.questionLines
          : raw?.statement
          ? [raw.statement]
          : [];

        return {
          itemName: raw?.ingredient?.name ?? raw?.itemName ?? "",
          itemIconUrl: raw?.ingredient?.iconUrl ?? raw?.itemIconUrl ?? "",
          questionLines: lines,
          attempted: !!raw?.attempted,
        };
      } catch (e) {
        const { status, msg } = parseApiError(e);
        console.error("[/quiz/daily] failed:", status, msg, e?.response?.data);

        // 204: 오늘 퀴즈 없음 → 종료 페이지로
        if (status === 204) {
          navigate("/my/points-daily/result", {
            replace: true,
            state: { closed: true },
          });
          return null;
        }

        // 401: 로그인 만료
        if (status === 401) {
          navigate("/login", { replace: true, state: { returnTo: "/my/points-daily" } });
          return null;
        }

        // 409/403: 이미 참여
        if (status === 409 || status === 403) {
          navigate("/my/points-daily/result", {
            replace: true,
            state: { alreadySolved: true },
          });
          return null;
        }

        // 5xx: DEV에서는 모의 문제로 폴백(UX 끊기지 않게)
        if (String(import.meta.env.MODE).includes("dev") && DEV_MOCK_ON_5XX && status >= 500) {
          console.warn("[/quiz/daily] 5xx → using MOCK_QUIZ");
          return { ...MOCK_QUIZ };
        }

        // 기타: 에러 그대로 던져서 아래 isError 분기 태움
        throw e;
      }
    },
    // 5xx일 때만 1회 재시도(짧게)
    retry: (failureCount, e) => {
      const s = e?.response?.status || 0;
      if (s >= 500 && failureCount < 1) return true;
      return false;
    },
    retryDelay: () => 300,
    staleTime: 60 * 1000,
  });

  // 정답 제출
  const { mutate: submitAnswer } = useMutation({
    mutationFn: async (answer) => {
      await testLoginIfNeeded();
      const payload = { answer, idempotencyKey: crypto.randomUUID() };
      const res = await APIService.private.post("/quiz/daily/answer", payload);
      return res?.data ?? res;
    },
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ["me", "summary"] });
      await qc.refetchQueries({ queryKey: ["me", "summary"], type: "active" });

      navigate("/my/points-daily/result", {
        state: {
          result: res?.result,
          awarded: res?.awarded ?? 0,
          ingredientName: res?.ingredientName || res?.item?.name,
        },
      });
    },
    onError: (e) => {
      const { status, msg } = parseApiError(e);
      if (status === 403 || status === 409) {
        alert("오늘 퀴즈는 이미 참여했어");
      } else {
        alert("제출에 실패했어. 잠시 후 다시 시도해줘");
      }
      if (import.meta.env.DEV)
        console.error("[/quiz/daily/answer] failed:", status, msg, e?.response?.data);
    },
  });

  // 로딩 스켈레톤
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

  // 에러 분기 (기타 남은 케이스)
  if (isError) {
    const { msg } = parseApiError(error);
    return (
      <DailyPointsPageWrapper>
        <QuestionBox style={{ marginTop: 80 }}>
          <QTextStrong>문제를 불러오지 못했어</QTextStrong>
          <p style={{ color: "#787885", marginTop: 8, fontSize: 14 }}>잠시 후 다시 시도해줘</p>
          {import.meta.env.DEV && (
            <p style={{ color: "#ADADAF", marginTop: 6, fontSize: 12 }}>디버그: {String(msg)}</p>
          )}
        </QuestionBox>
      </DailyPointsPageWrapper>
    );
  }

  // 정상/폴백 렌더
  const itemName = data?.itemName || "";
  const itemIcon = data?.itemIconUrl || defaultItemIcon;
  const q1 = data?.questionLines?.[0] || "";
  const q2 = data?.questionLines?.[1] || null;

  const handleSelect = (answer) => {
    // 폴백 문제일 땐 제출 막아두는 선택지(원하면 주석 해제)
    // if (data?.__fallback === "mock500") return alert("서버 복구 후 다시 시도해줘");
    submitAnswer(answer);
  };

  return (
    <DailyPointsPageWrapper>
      <IconDiv>
        <ItemIcon src={itemIcon} alt={itemName || "item"} />
      </IconDiv>

      {(q1 || q2) && (
        <QuestionBox>
          {q1 && <QTextStrong>{q1}</QTextStrong>}
          {q2 && <QTextStrong>{q2}</QTextStrong>}
          {data?.__fallback === "mock500" && import.meta.env.DEV && (
            <p style={{ color: "#ADADAF", marginTop: 8, fontSize: 12 }}>
              DEV: 서버 5xx로 모의 문제 표시 중
            </p>
          )}
        </QuestionBox>
      )}

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
