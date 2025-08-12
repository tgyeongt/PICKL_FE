import { createContext, useContext, useMemo, useReducer } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { APIService } from "../../../shared/lib/api";

const DEFAULT_RULES = {
  pointStep: 1000, // 1,000P 단위
  minPointConvert: 1000, // 최소 1,000P
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

  // ✅ API로 내 포인트와 joinedDays 가져오기
  const { data: stats } = useQuery({
    queryKey: ["me", "stats"],
    queryFn: async () => {
      const res = await APIService.private.get("/me/stats");
      const raw = res?.data ?? res ?? {};
      return {
        points: Number.isFinite(raw.points) ? raw.points : 3000,
        joinedDays: Number.isFinite(raw.joinedDays) ? raw.joinedDays : 23,
      };
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  const [state, dispatch] = useReducer(reducer, {
    pointAmount: 1000,
    selectedVoucher: "seoul",
  });

  const rules = DEFAULT_RULES;

  const derived = useMemo(() => {
    const maxPoint = stats?.points ?? 0;
    const okStep = state.pointAmount % rules.pointStep === 0;
    const okMin = state.pointAmount >= rules.minPointConvert;
    const okMax = state.pointAmount <= maxPoint;
    const pointOk = state.pointAmount > 0 && okStep && okMin && okMax;

    const wonAmount = (state.pointAmount || 0) * rules.pointToWon;
    const disabled = !pointOk || !state.selectedVoucher;

    return { maxPoint, pointOk, disabled, wonAmount, rules };
  }, [state.pointAmount, state.selectedVoucher, stats, rules]);

  const { mutateAsync: convert, isPending: converting } = useMutation({
    mutationFn: async () => {
      const payload = {
        pointAmount: state.pointAmount,
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

  return (
    <ConvertPointsContext.Provider value={{ stats, state, dispatch, derived, convert, converting }}>
      {children}
    </ConvertPointsContext.Provider>
  );
}

export function useConvertPoints() {
  const ctx = useContext(ConvertPointsContext);
  if (!ctx) throw new Error("useConvertPoints must be used within ConvertPointsProvider");
  return ctx;
}
