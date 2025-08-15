import { createContext, useContext, useMemo, useReducer } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { APIService } from "../../../shared/lib/api";
import useMySummary from "../hooks/useMySummary";

const DEFAULT_RULES = {
  pointStep: 1000,
  minPointConvert: 1000,
  pointToWon: 10,
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
  const stats = { points: summary?.points ?? 0, joinedDays: summary?.daysSinceFriend ?? 0 };

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

    return {
      maxPoint,
      wonAmount: amt * DEFAULT_RULES.pointToWon,
      canSubmit: reasons.length === 0 && !!state.selectedVoucher,
      reasons,
      disabled: isLoading || reasons.length > 0 || !state.selectedVoucher,
      rules: DEFAULT_RULES,
      isLoading,
    };
  }, [state.pointAmount, state.selectedVoucher, stats.points, isLoading]);

  const { mutateAsync: convert, isPending: converting } = useMutation({
    mutationFn: async (amountOverride) => {
      const pointAmount = Number(amountOverride ?? state.pointAmount) || 0;
      const payload = { pointAmount, voucherType: state.selectedVoucher };
      const res = await APIService.private.post("/points/convert", payload);
      return res?.data ?? res;
    },

    onMutate: async (amountOverride) => {
      const pointAmount = Number(amountOverride ?? state.pointAmount) || 0;
      await qc.cancelQueries({ queryKey: ["me", "summary"] });
      const previous = qc.getQueryData(["me", "summary"]);
      qc.setQueryData(["me", "summary"], (current) => ({
        ...(current || {}),
        points: Math.max(0, (current?.points ?? 0) - pointAmount),
      }));
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(["me", "summary"], context.previous);
      }
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["me", "summary"] });
      await qc.refetchQueries({ queryKey: ["me", "summary"], type: "active" });
    },
    onSettled: () => {
      dispatch({ type: "RESET" });
    },
  });

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
