import { createContext, useContext, useMemo, useReducer } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { APIService } from "../../../shared/lib/api";

const DEFAULT_RULES = {
  pointStep: 1000,
  minPointConvert: 1000,
  pointToWon: 10,
};

// 개발용 목 스위치/기본값
const USE_DEV_MOCK = true;
const DEV_DEFAULT_STATS = { points: 12300, joinedDays: 23 };

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

  const { data: statsFromApi, isLoading } = useQuery({
    queryKey: ["me", "stats"],
    queryFn: async () => {
      const res = await APIService.private.get("/me/stats");
      const raw = res?.data ?? res ?? {};
      const pointsNum = Number(raw.points);
      const joinedDaysNum = Number(raw.joinedDays);
      return {
        points: Number.isFinite(pointsNum) ? pointsNum : 0,
        joinedDays: Number.isFinite(joinedDaysNum) ? joinedDaysNum : 23,
      };
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  // 개발 중엔 0이면 목 포인트로 대체
  const stats = USE_DEV_MOCK
    ? {
        points: (statsFromApi?.points ?? 0) > 0 ? statsFromApi.points : DEV_DEFAULT_STATS.points,
        joinedDays: statsFromApi?.joinedDays ?? DEV_DEFAULT_STATS.joinedDays,
      }
    : statsFromApi;

  const [state, dispatch] = useReducer(reducer, {
    pointAmount: 0,
    selectedVoucher: "seoul",
  });

  const rules = DEFAULT_RULES;

  const derived = useMemo(() => {
    const maxPoint = stats?.points ?? 0;
    const amt = Number(state.pointAmount) || 0;

    const okStep = amt % rules.pointStep === 0;
    const okMin = amt >= rules.minPointConvert;
    const okMax = amt <= maxPoint;
    const pointOk = amt > 0 && okStep && okMin && okMax;

    return {
      maxPoint,
      pointOk,
      wonAmount: amt * rules.pointToWon,
      disabled: isLoading || !pointOk || !state.selectedVoucher,
      rules,
      isLoading,
    };
  }, [state.pointAmount, state.selectedVoucher, stats, rules, isLoading]);

  const { mutateAsync: convert, isPending: converting } = useMutation({
    mutationFn: async () => {
      const payload = {
        pointAmount: Number(state.pointAmount) || 0,
        voucherType: state.selectedVoucher,
      };

      if (USE_DEV_MOCK) {
        // 가짜 지연 후 성공 응답
        await new Promise((r) => setTimeout(r, 400));
        return { ok: true, mock: true, payload };
      }

      const res = await APIService.private.post("/points/convert", payload);
      return res?.data ?? res;
    },
    onSuccess: async () => {
      if (USE_DEV_MOCK) {
        // 캐시 포인트 즉시 차감
        qc.setQueryData(["me", "stats"], (prev) => {
          const base = prev ?? DEV_DEFAULT_STATS;
          const next = Math.max(
            0,
            (base.points ?? DEV_DEFAULT_STATS.points) - (Number(state.pointAmount) || 0)
          );
          return { ...base, points: next };
        });
      } else {
        await qc.invalidateQueries({ queryKey: ["me", "stats"] });
      }
      dispatch({ type: "RESET" });
    },
  });

  const setPointAmount = (n) => dispatch({ type: "SET_POINT_AMOUNT", value: n });
  const setVoucher = (v) => dispatch({ type: "SET_VOUCHER", value: v });

  return (
    <ConvertPointsContext.Provider
      value={{
        stats,
        state,
        derived,
        dispatch,
        setPointAmount,
        setVoucher,
        rules,
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
