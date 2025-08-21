import { useAtomValue } from "jotai";
import { pointsAtom } from "../convert/ConvertPointsContext";
import useMySummary from "./useMySummary";

export default function useCurrentPoints(opts) {
  const atomPoints = useAtomValue(pointsAtom);
  const { data: summary } = useMySummary({ refetchOnMount: false, ...(opts || {}) });
  // atom 값이 있으면 그걸 최우선, 없으면 서버값
  return atomPoints ?? summary?.points ?? 0;
}
