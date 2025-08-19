import useHeader from "../../shared/hooks/useHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import {
  DailyPointsPageWrapper,
  IconDiv,
  ItemIcon,
  QuestionBox,
  QTextStrong,
  OptionBox,
  OptionCard,
  EmojiIcon,
  ItemEmoji,
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
import { useSetAtom } from "jotai";
import { pointsAtom } from "./convert/ConvertPointsContext";

const LAST_ID_KEY = "dailyPoints:lastQuestionId";
const DEV_MOCK_ON_5XX = false;
const MOCK_QUIZ = {
  itemName: "토마토",
  itemIconUrl: "",
  questionLines: ["토마토는 과일이다?", "(연동 오류로 모의 문제 표시 중)"],
  attempted: false,
  __fallback: "mock500",
};

// 공통 에러 파서
function parseApiError(e) {
  const status = e?.response?.status;
  const msg = e?.response?.data?.message || e?.message || "unknown";
  return { status, msg };
}

// 아이콘 디코더 (U+ 코드포인트 대비)
function decodeEmoji(s = "") {
  if (s?.startsWith?.("U+")) {
    return String.fromCodePoint(parseInt(s.replace("U+", ""), 16));
  }
  return s || "";
}

export default function DailyPointsPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const adWatched = !!state?.adWatched;
  const adNonceFromNav = state?.adNonce;

  const [retryToken, setRetryToken] = useState(null);
  const [reseed, setReseed] = useState(null); // 강제 재요청용 난수
  const retryCountRef = useRef(0);

  const qc = useQueryClient();
  const setPoints = useSetAtom(pointsAtom);

  useHeader({ title: "", showBack: true });

  // 광고에서 돌아왔을 때 캐시 제거 & 키 갱신
  useEffect(() => {
    if (!adWatched) return;
    const token = adNonceFromNav || String(Date.now());
    setRetryToken(token);
    setReseed(crypto.randomUUID());
    retryCountRef.current = 0; // 재시도 카운터 초기화
    qc.removeQueries({ predicate: (q) => String(q.queryKey?.[0]) === "dailyPoints" });
    qc.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0]) === "dailyPoints" });
    navigate(".", { replace: true, state: null });
  }, [adWatched, adNonceFromNav, navigate, qc]);

  // 오늘의 문제 조회
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dailyPoints", "today", retryToken, reseed],
    queryFn: async () => {
      await testLoginIfNeeded();
      const path = "/quiz/daily";
      const params = {
        _ts: Date.now(),
        ...(retryToken ? { retry: 1, _ad: 1, nonce: retryToken, reseed } : {}),
      };

      try {
        const res = await APIService.private.get(path, { params });
        const raw = res?.data ?? res ?? {};
        console.log("[daily] raw response =", raw);

        // 아이콘 처리
        const rawIcon = raw?.ingredient?.icon ?? raw?.ingredient?.iconUrl ?? raw?.itemIconUrl ?? "";
        const iconValue = decodeEmoji(rawIcon);
        const iconKind =
          /^https?:\/\//.test(iconValue) || /^data:image\//.test(iconValue)
            ? "url"
            : iconValue
            ? "emoji"
            : "none";

        const lines = Array.isArray(raw?.questionLines)
          ? raw.questionLines
          : raw?.statement
          ? [raw.statement]
          : [];

        console.log(
          "[daily] mapped id =",
          raw?.id ?? raw?.questionId,
          "attempted =",
          raw?.attempted
        );

        return {
          id: raw?.id ?? raw?.questionId,
          itemName: raw?.ingredient?.name ?? raw?.itemName ?? "",
          itemIconValue: iconValue,
          itemIconKind: iconKind, // 'url' | 'emoji' | 'none'
          questionLines: lines,
          attempted: !!raw?.attempted, // ✅ 서버값 그대로 사용
        };
      } catch (e) {
        const { status, msg } = parseApiError(e);
        console.error("[GET /quiz/daily] failed:", status, msg, e?.response?.data);

        if (status === 204) {
          navigate("/my/points-daily/result", { replace: true, state: { closed: true } });
          return null;
        }
        if (status === 401) {
          navigate("/login", { replace: true, state: { returnTo: "/my/points-daily" } });
          return null;
        }
        if ((status === 409 || status === 403) && !retryToken) {
          navigate("/my/points-daily/result", { replace: true, state: { alreadySolved: true } });
          return null;
        }
        if (String(import.meta.env.MODE).includes("dev") && DEV_MOCK_ON_5XX && status >= 500) {
          console.warn("[/quiz/daily] 5xx → using MOCK_QUIZ");
          return { ...MOCK_QUIZ };
        }
        throw e;
      }
    },
    retry: (failureCount, e) => {
      const s = e?.response?.status || 0;
      return s >= 500 && failureCount < 1;
    },
    retryDelay: () => 300,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    keepPreviousData: false,
  });

  // ▶︎ 새 문제 보장 로직
  useEffect(() => {
    if (!data) return;
    try {
      const lastId = sessionStorage.getItem(LAST_ID_KEY);
      const curId = data?.id ? String(data.id) : "";
      const sameAsBefore = !!curId && lastId === curId;
      const looksAlreadyAttempted = !!data?.attempted;

      // 1) 정상 케이스: 새 ID 받았으면 저장하고 종료
      if (curId && !sameAsBefore && !looksAlreadyAttempted) {
        sessionStorage.setItem(LAST_ID_KEY, curId);
        retryCountRef.current = 0;
        return;
      }

      // 2) 광고 복귀 상황 + 같은 문제거나 attempted=true면, 최대 2번까지만 강제 재요청
      const underRetry = Boolean(retryToken) && retryCountRef.current < 2;
      if (underRetry) {
        retryCountRef.current += 1;
        console.warn("[daily] same/attempted detected → force refetch", {
          lastId,
          curId,
          attempted: data?.attempted,
          try: retryCountRef.current,
        });
        // 쿼리키를 바꾸기 위해 reseed 갱신
        setReseed(crypto.randomUUID());
        // 캐시 무효화
        qc.invalidateQueries({ queryKey: ["dailyPoints", "today"] });
      } else {
        // 3) 그래도 계속 같다면 서버가 새 문제를 안 주는 상황 → 사용자에게 안내
        if (sameAsBefore || looksAlreadyAttempted) {
          alert("새 문제가 준비되지 않았어. 잠시 후 다시 시도해줘!");
        }
      }
    } catch {
      // err
    }
  }, [data, retryToken, qc]);

  // 정답 제출
  const { mutate: submitAnswer } = useMutation({
    mutationFn: async (answer) => {
      await testLoginIfNeeded();
      const payload = {
        answer,
        ...(data?.id ? { questionId: data.id } : {}),
        idempotencyKey: crypto.randomUUID(),
      };
      const res = await APIService.private.post("/quiz/daily/answer", payload);
      return res?.data ?? res;
    },
    onSuccess: async (res) => {
      const awarded = Number(res?.awarded ?? 0);

      // 1) React Query 캐시 즉시 증가
      qc.setQueryData(["me", "summary"], (cur) => {
        const prev = Number(cur?.points ?? 0);
        return { ...(cur || {}), points: prev + awarded };
      });

      // 2) 전역 atom도 즉시 증가
      setPoints((prev) => {
        const base = Number(prev ?? 0);
        return base + awarded;
      });

      // 3) 서버 동기화
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
      const { status } = parseApiError(e);
      if (status === 403 || status === 409) {
        alert("추가시도권이 만료되었어. ‘광고 보고 한 번 더’로 추가권을 먼저 받아줘!");
      } else {
        alert("제출에 실패했어. 잠시 후 다시 시도해줘.");
      }
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

  const itemName = data?.itemName || "";
  const iconKind = data?.itemIconKind || "none";
  const iconValue = data?.itemIconValue || "";
  const q1 = data?.questionLines?.[0] || "";
  const q2 = data?.questionLines?.[1] || null;

  const handleSelect = (answer) => submitAnswer(answer);

  return (
    <DailyPointsPageWrapper>
      <IconDiv>
        {iconKind === "url" && <ItemIcon src={iconValue} alt={`${itemName || "item"} 아이콘`} />}
        {iconKind === "emoji" && (
          <ItemEmoji role="img" aria-label={itemName || "item"}>
            {iconValue}
          </ItemEmoji>
        )}
        {iconKind === "none" && <ItemIcon src={defaultItemIcon} alt="기본 아이콘" />}
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
