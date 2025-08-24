import { createContext, useContext, useMemo, useReducer, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { atom } from "jotai";
import useMySummary from "../hooks/useMySummary";

// 전역 포인트 상태 관리
export const pointsAtom = atom(null);

const DEFAULT_RULES = {
  pointStep: 10000,
  minPointConvert: 10000,
  pointToWon: 1,
};

const ConvertPointsContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "SET_POINT_AMOUNT":
      return { ...state, pointAmount: action.value };
    case "SET_VOUCHER":
      return { ...state, selectedVoucher: action.value };
    case "RESET":
      return { ...state, pointAmount: 0 };
    default:
      return state;
  }
}

export function ConvertPointsProvider({ children }) {
  const qc = useQueryClient();
  const { data: summary, isLoading } = useMySummary();

  // 전역 포인트 상태 사용
  const [globalPoints, setGlobalPoints] = useAtom(pointsAtom);

  // API에서 포인트 값이 바뀌면 전역 atom도 항상 동기화
  useEffect(() => {
    if (summary?.points == null) return;

    // 전역 상태가 없거나 서버 값과 다른 경우 서버 값을 신뢰해 갱신
    // 단, 포인트 전환 후에는 전역 상태를 우선시
    if (globalPoints === null || globalPoints === undefined) {
      setGlobalPoints(summary.points);
    } else if (globalPoints !== summary.points) {
      // 전역 상태가 있지만 서버 값과 다른 경우
      // 포인트 전환 후일 수 있으므로 전역 상태를 유지
    }
  }, [summary?.points, setGlobalPoints, globalPoints]);

  // 초기 로딩 시 전역 상태 설정
  useEffect(() => {
    if (summary?.points != null && globalPoints === null) {
      setGlobalPoints(summary.points);
    }
  }, [summary?.points, globalPoints, setGlobalPoints]);

  // 전역 상태가 세팅되기 전엔 fallback으로 summary.points 사용
  const currentPoints =
    globalPoints !== null && globalPoints !== undefined ? globalPoints : summary?.points ?? 0;

  const stats = {
    points: currentPoints,
    joinedDays: summary?.daysSinceFriend ?? 0,
  };

  const [state, dispatch] = useReducer(reducer, {
    pointAmount: 0,
    selectedVoucher: "seoul",
  });

  const derived = useMemo(() => {
    const maxPoint = stats.points;
    const amt = Number(state.pointAmount) || 0;
    const reasons = [];

    if (amt <= 0) reasons.push("전환 포인트를 입력해주세요");
    if (amt > 0 && amt < DEFAULT_RULES.minPointConvert)
      reasons.push(
        `${DEFAULT_RULES.minPointConvert.toLocaleString()}P 이상부터 전환할 수 있습니다`
      );
    if (amt > 0 && amt % DEFAULT_RULES.pointStep !== 0)
      reasons.push(`${DEFAULT_RULES.pointStep}P 단위로 입력해주세요`);
    if (amt > maxPoint)
      reasons.push(`보유 포인트(${maxPoint.toLocaleString()}P)보다 많이 전환할 수 없습니다`);

    const canSubmit = reasons.length === 0 && !!state.selectedVoucher;

    return {
      maxPoint,
      wonAmount: amt * DEFAULT_RULES.pointToWon,
      canSubmit,
      reasons,
      disabled: isLoading || reasons.length > 0 || !state.selectedVoucher,
      rules: DEFAULT_RULES,
      isLoading,
    };
  }, [state.pointAmount, state.selectedVoucher, stats.points, isLoading]);

  // API 호출 없이 단순히 로컬 상태만 업데이트
  const convert = async (amountOverride) => {
    const pointAmount = Number(amountOverride ?? state.pointAmount) || 0;

    // 전역 상태에서 포인트 차감
    const newPoints = Math.max(0, currentPoints - pointAmount);

    // 전역 상태 업데이트
    setGlobalPoints(newPoints);

    // React Query 캐시도 함께 업데이트
    qc.setQueryData(["me", "summary"], (current) => ({
      ...(current || {}),
      points: newPoints,
    }));

    // 입력값 리셋
    dispatch({ type: "RESET" });

    // 상태 업데이트가 확실히 반영되도록 강제 리렌더링
    qc.invalidateQueries(["me", "summary"]);

    return { success: true };
  };

  const converting = false; // 더 이상 로딩 상태가 필요 없음

  return (
    <ConvertPointsContext.Provider
      value={{
        stats,
        state,
        derived,
        dispatch,
        setPointAmount: (n) => dispatch({ type: "SET_POINT_AMOUNT", value: n }),
        setVoucher: (v) => dispatch({ type: "SET_VOUCHER", value: v }),
        rules: DEFAULT_RULES,
        convert,
        converting,
      }}
    >
      {children}
    </ConvertPointsContext.Provider>
  );
}

export function useConvertPoints() {
  const ctx = useContext(ConvertPointsContext);
  if (!ctx) throw new Error("useConvertPoints must be used within ConvertPointsProvider");
  return ctx;
}
