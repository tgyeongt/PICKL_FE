import { createContext, useContext, useMemo, useReducer } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { APIService } from "../../../shared/lib/api";

const DEFAULT_RULES = {
  pointStep: 100, // 100P 단위
  minPointConvert: 500, // 최소 500P
  pointToWon: 10, // 1P = 10원
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

  const { data: stats, isLoading } = useQuery({
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
      const res = await APIService.private.post("/points/convert", payload);
      return res?.data ?? res;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me", "stats"] });
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
