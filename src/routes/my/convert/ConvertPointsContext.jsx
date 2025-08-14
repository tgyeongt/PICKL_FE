import { createContext, useContext, useMemo, useReducer, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { APIService } from "../../../shared/lib/api";

const DEFAULT_RULES = {
  pointStep: 1000,
  minPointConvert: 1000,
  pointToWon: 10,
};

// 🔹 개발용 목 스위치/기본값
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

  useEffect(() => {
    if (USE_DEV_MOCK && !qc.getQueryData(["me", "stats"])) {
      qc.setQueryData(["me", "stats"], DEV_DEFAULT_STATS);
    }
  }, []);

  // 📌 유저 포인트 불러오기
  const { data: statsFromApi, isLoading } = useQuery({
    queryKey: ["me", "stats"],
    queryFn: async () => {
      const res = await APIService.private.get("/me/stats");
      const raw = res?.data ?? res ?? {};
      return {
        points: Number.isFinite(Number(raw.points)) ? Number(raw.points) : 0,
        joinedDays: Number.isFinite(Number(raw.joinedDays)) ? Number(raw.joinedDays) : 23,
      };
    },
    staleTime: 60 * 1000,
    retry: 1,
    enabled: !USE_DEV_MOCK,
  });

  const cachedStats = qc.getQueryData(["me", "stats"]);
  const stats = USE_DEV_MOCK ? cachedStats ?? DEV_DEFAULT_STATS : statsFromApi ?? DEV_DEFAULT_STATS;

  const [state, dispatch] = useReducer(reducer, {
    pointAmount: 0,
    selectedVoucher: "seoul",
  });

  // 📌 파생 값 계산
  const derived = useMemo(() => {
    const maxPoint = stats?.points ?? 0;
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

    return {
      maxPoint,
      wonAmount: amt * DEFAULT_RULES.pointToWon,
      canSubmit: reasons.length === 0 && !!state.selectedVoucher,
      reasons,
      disabled: (USE_DEV_MOCK ? false : isLoading) || reasons.length > 0 || !state.selectedVoucher,
      rules: DEFAULT_RULES,
      isLoading: USE_DEV_MOCK ? false : isLoading,
    };
  }, [state.pointAmount, state.selectedVoucher, stats?.points, isLoading]);

  // 📌 전환 mutation
  const { mutateAsync: convert, isPending: converting } = useMutation({
    mutationFn: async (amountOverride) => {
      const pointAmount = Number(amountOverride ?? state.pointAmount) || 0;
      const payload = {
        pointAmount,
        voucherType: state.selectedVoucher,
      };

      if (USE_DEV_MOCK) {
        await new Promise((r) => setTimeout(r, 400));
        return { ok: true, mock: true, payload };
      }

      const res = await APIService.private.post("/points/convert", payload);
      return res?.data ?? res;
    },
    onSuccess: async (_data, amountOverride) => {
      const amount = Number(amountOverride ?? state.pointAmount) || 0;

      if (USE_DEV_MOCK) {
        qc.setQueryData(["me", "stats"], (prev) => {
          const basePoints = Number(
            prev && prev.points != null ? prev.points : DEV_DEFAULT_STATS.points
          );
          return {
            ...(prev ?? DEV_DEFAULT_STATS),
            points: Math.max(0, basePoints - amount),
          };
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
