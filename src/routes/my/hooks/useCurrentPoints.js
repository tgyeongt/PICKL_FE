import { useAtomValue } from "jotai";
import { pointsAtom } from "../convert/ConvertPointsContext";
import useMySummary from "./useMySummary";

export default function useCurrentPoints(opts) {
  const atomPoints = useAtomValue(pointsAtom);
  const { data: summary } = useMySummary({ refetchOnMount: false, ...(opts || {}) });

  // 전역 상태가 있으면 우선 사용, 없으면 API 데이터 사용
  if (atomPoints !== null && atomPoints !== undefined) {
    return atomPoints;
  }

  return summary?.points ?? 0;
}
