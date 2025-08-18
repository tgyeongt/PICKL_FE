import styled from "styled-components";
import { useAtomValue } from "jotai";
import { selectedAddressAtom } from "../map/state/addressAtom";
import useCurrentAddress from "../map/hooks/useCurrentAddress";
import { pointsAtom } from "./convert/ConvertPointsContext";
import useMySummary from "./hooks/useMySummary";
import pPoint from "@icon/my/pPointIcon.svg";

function deriveGuDong(addr = "") {
  const m1 = addr.match(/([\w가-힣]+구)\s+([\w가-힣]+동)/);
  if (m1) return `${m1[1]} ${m1[2]}`;
  const m2 = addr.match(/([\w가-힣]+구)/);
  if (m2) return m2[1];
  return addr.split(/\s+/).slice(0, 2).join(" ");
}

export default function PointStateSection() {
  const selectedAddress = useAtomValue(selectedAddressAtom);

  // 전역 포인트 상태 사용
  const globalPoints = useAtomValue(pointsAtom);
  const { data: summary } = useMySummary();

  const currentPoints = summary?.points ?? null ?? globalPoints ?? 0;

  const hasGlobalAddr = !!(selectedAddress?.jibunAddress || selectedAddress?.roadAddress);
  const { address: fallbackAddr } = useCurrentAddress(!hasGlobalAddr);

  const rawAddr =
    selectedAddress?.jibunAddress || selectedAddress?.roadAddress || fallbackAddr || "";

  const shortAddr = deriveGuDong(rawAddr);

  return (
    <PointStateSectionWrapper>
      <LocationText>현위치 : {shortAddr || "위치 불러오는 중"}</LocationText>
      <Label>피클POINT</Label>
      <PointRow>
        <PointNumber>{formatNumber(currentPoints)}</PointNumber>
        <PointIcon src={pPoint} alt="" />
      </PointRow>
    </PointStateSectionWrapper>
  );
}

function formatNumber(n) {
  try {
    return Number(n).toLocaleString();
  } catch {
    return n ?? "";
  }
}

const PointStateSectionWrapper = styled.div`
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  height: 125px;
  margin-top: 41px;
  margin-bottom: 0;
`;

const LocationText = styled.p`
  color: #adadaf;
  font-family: Pretendard;
  font-size: 8px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;

const Label = styled.p`
  color: #323232;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 22px;
`;

const PointRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 0;
`;

const PointNumber = styled.span`
  color: #58d848;
  text-align: center;
  font-family: Pretendard;
  font-size: 32px;
  font-style: normal;
  font-weight: 700;
  line-height: 48px;
`;

const PointIcon = styled.img`
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
`;
