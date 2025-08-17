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

  // 광고에서 돌아왔을 때: 캐시 전량 제거 + 키 변경 + state 비우기
  useEffect(() => {
    if (!adWatched) return;

    const token = adNonceFromNav || String(Date.now());
    setRetryToken(token);

    // 🔥 dailyPoints 관련 캐시 전부 제거
    qc.removeQueries({ predicate: (q) => String(q.queryKey?.[0]) === "dailyPoints" });
    // 안전망 invalidate
    qc.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0]) === "dailyPoints" });

    // 히스토리 state 비워서 재진입/새로고침 시 중복 로직 방지
    navigate(".", { replace: true, state: null });
  }, [adWatched, adNonceFromNav, navigate, qc]);

  // 오늘의 문제 조회
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dailyPoints", "today", retryToken], // 광고 후엔 다른 키로 강제 재조회
    queryFn: async () => {
      await testLoginIfNeeded();

      const path = "/quiz/daily";
      const params = {
        _ts: Date.now(), // 캐시 버스터(브라우저/프록시 대비)
        ...(retryToken ? { retry: 1, _ad: 1 } : {}), // 서버에 힌트 주고 싶다면 사용
      };

      try {
        const res = await APIService.private.get(path, { params });
        const raw = res?.data ?? res ?? {};

        const lines = Array.isArray(raw?.questionLines)
          ? raw.questionLines
          : raw?.statement
          ? [raw.statement]
          : [];

        return {
          id: raw?.id ?? raw?.questionId, // 서버가 내려주면 보관
          itemName: raw?.ingredient?.name ?? raw?.itemName ?? "",
          itemIconUrl: raw?.ingredient?.iconUrl ?? raw?.itemIconUrl ?? "",
          questionLines: lines,
          attempted: !!raw?.attempted,
          // 광고 시 추가 시도라면 attempted를 강제로 false로 보정(서버가 정확히 내려주면 제거 가능)
          ...(retryToken && { attempted: false }),
        };
      } catch (e) {
        const { status, msg } = parseApiError(e);
        console.error("[GET /quiz/daily] failed:", status, msg, e?.response?.data);

        // 204: 오늘 퀴즈 종료
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

        // 409/403: 이미 참여 (광고 전이라면 결과 페이지로 보냄)
        if ((status === 409 || status === 403) && !retryToken) {
          navigate("/my/points-daily/result", {
            replace: true,
            state: { alreadySolved: true },
          });
          return null;
        }

        // 5xx: DEV에서만 모의 문제 폴백
        if (String(import.meta.env.MODE).includes("dev") && DEV_MOCK_ON_5XX && status >= 500) {
          console.warn("[/quiz/daily] 5xx → using MOCK_QUIZ");
          return { ...MOCK_QUIZ };
        }

        // 기타 에러 전파
        throw e;
      }
    },
    // 5xx일 때만 1회 재시도
    retry: (failureCount, e) => {
      const s = e?.response?.status || 0;
      if (s >= 500 && failureCount < 1) return true;
      return false;
    },
    retryDelay: () => 300,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    keepPreviousData: false,
  });

  // 정답 제출
  const { mutate: submitAnswer } = useMutation({
    mutationFn: async (answer) => {
      await testLoginIfNeeded();
      const payload = {
        answer,
        // 서버가 questionId 요구하면 아래 주석 해제
        ...(data?.id ? { questionId: data.id } : {}),
        idempotencyKey: crypto.randomUUID(),
      };
      const res = await APIService.private.post("/quiz/daily/answer", payload);
      return res?.data ?? res;
    },
    onSuccess: async (res) => {
      // 포인트/요약 invalidate
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
        // 서버 정책에 따라 추가 시도권 미개시/만료 시 여기로 떨어짐
        alert("추가시도권이 만료되었어. ‘광고 보고 한 번 더’로 추가권을 먼저 받아줘!");
      } else {
        alert("제출에 실패했어. 잠시 후 다시 시도해줘.");
      }
      if (import.meta.env.DEV) {
        console.error("[POST /quiz/daily/answer] failed:", status, msg, e?.response?.data);
      }
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

  // 에러 분기
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
    // 폴백 문제일 땐 제출 막고 싶으면 주석 해제
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
