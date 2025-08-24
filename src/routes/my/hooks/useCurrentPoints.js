import { useAtomValue } from "jotai";
import { pointsAtom } from "../convert/ConvertPointsContext";
import useMySummary from "./useMySummary";

export default function useCurrentPoints(opts) {
  const atomPoints = useAtomValue(pointsAtom);
  const { data: summary } = useMySummary({ refetchOnMount: false, ...(opts || {}) });

  return atomPoints ?? summary?.points ?? 0;
}
