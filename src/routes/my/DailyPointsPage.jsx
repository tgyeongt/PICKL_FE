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

const LAST_KEY = "dailyPoints:lastQuestionKey";
const DEV_MOCK_ON_5XX = false;

function parseApiError(e) {
  const status = e?.response?.status;
  const msg = e?.response?.data?.message || e?.message || "unknown";
  return { status, msg };
}
function decodeEmoji(s = "") {
  if (s?.startsWith?.("U+")) return String.fromCodePoint(parseInt(s.replace("U+", ""), 16));
  return s || "";
}

function buildQuestionKey(raw) {
  const d = raw?.date || "";
  const iid = raw?.ingredient?.id ?? "";
  const st = (raw?.statement || "").trim();
  return `${d}|${iid}|${st}`;
}

export default function DailyPointsPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const adWatched = !!state?.adWatched;
  const adNonceFromNav = state?.adNonce;

  const [retryToken, setRetryToken] = useState(null);
  const [reseed, setReseed] = useState(null);
  const retryCountRef = useRef(0);

  const qc = useQueryClient();
  const setPoints = useSetAtom(pointsAtom);

  useHeader({ title: "", showBack: true });

  useEffect(() => {
    if (!adWatched) return;
    const token = adNonceFromNav || String(Date.now());
    setRetryToken(token);
    setReseed(crypto.randomUUID());
    retryCountRef.current = 0;
    qc.removeQueries({ predicate: (q) => String(q.queryKey?.[0]) === "dailyPoints" });
    qc.invalidateQueries({ predicate: (q) => String(q.queryKey?.[0]) === "dailyPoints" });
    navigate(".", { replace: true, state: null });
  }, [adWatched, adNonceFromNav, navigate, qc]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["dailyPoints", "today", retryToken, reseed],
    queryFn: async () => {
      await testLoginIfNeeded();
      const params = {
        _ts: Date.now(),
        ...(retryToken ? { retry: 1, _ad: 1, nonce: retryToken, reseed } : {}),
      };

      try {
        const res = await APIService.private.get("/quiz/daily", { params });
        const raw = res?.data ?? res ?? {};
        // console.log("[daily] raw =", raw);

        const iconValue = decodeEmoji(raw?.ingredient?.iconUrl ?? raw?.ingredient?.icon ?? "");
        const iconKind =
          /^https?:\/\//.test(iconValue) || /^data:image\//.test(iconValue)
            ? "url"
            : iconValue
            ? "emoji"
            : "none";

        const key = buildQuestionKey(raw);

        return {
          key,
          date: raw?.date,
          itemName: raw?.ingredient?.name ?? "",
          itemIconValue: iconValue,
          itemIconKind: iconKind,
          questionLines: raw?.statement ? [raw.statement] : [],
          attempted: !!raw?.attempted,
          canAnswer: !!raw?.canAnswer,
          remainingAttempts: raw?.remainingAttempts ?? 0,
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
          return {
            key: `dev|${Date.now()}`,
            date: "dev",
            itemName: "토마토",
            itemIconValue: "U+1F345",
            itemIconKind: "emoji",
            questionLines: ["토마토는 과일이다?", "(모의 문제)"],
            attempted: false,
            canAnswer: true,
            remainingAttempts: 1,
          };
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

  useEffect(() => {
    if (!data) return;
    try {
      const lastKey = sessionStorage.getItem(LAST_KEY);
      const curKey = data?.key || "";
      const sameAsBefore = !!curKey && lastKey === curKey;
      const blocked = data?.attempted || data?.canAnswer === false;

      if (curKey && !sameAsBefore && !blocked) {
        sessionStorage.setItem(LAST_KEY, curKey);
        retryCountRef.current = 0;
        return;
      }

      const underRetry = Boolean(retryToken) && retryCountRef.current < 2;
      if (underRetry) {
        retryCountRef.current += 1;
        console.warn("[daily] same/attempted/cannot-answer → force refetch", {
          lastKey,
          curKey,
          attempted: data?.attempted,
          canAnswer: data?.canAnswer,
          try: retryCountRef.current,
        });
        setReseed(crypto.randomUUID());
        qc.invalidateQueries({ queryKey: ["dailyPoints", "today"] });
      } else if (sameAsBefore || blocked) {
        alert("새 문제가 준비되지 않았어. 잠시 후 다시 시도해줘!");
      }
    } catch (err) {
      void err;
    }
  }, [data, retryToken, qc]);

  const { mutate: submitAnswer } = useMutation({
    mutationFn: async (answer) => {
      await testLoginIfNeeded();
      const payload = { answer, idempotencyKey: crypto.randomUUID() };
      const res = await APIService.private.post("/quiz/daily/answer", payload);
      return res?.data ?? res;
    },
    onSuccess: async (res) => {
      const awarded = Number(res?.awarded ?? 0);

      qc.setQueryData(["me", "summary"], (cur) => {
        const prev = Number(cur?.points ?? 0);
        return { ...(cur || {}), points: prev + awarded };
      });

      setPoints((prev) => Number(prev ?? 0) + awarded);

      await qc.invalidateQueries({ queryKey: ["me", "summary"] });
      await qc.refetchQueries({ queryKey: ["me", "summary"], type: "active" });

      navigate("/my/points-daily/result", {
        state: {
          result: res?.result,
          awarded: res?.awarded ?? 0,
          ingredientName: data?.itemName || res?.ingredientName || res?.item?.name,
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
