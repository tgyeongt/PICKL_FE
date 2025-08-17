import styled from "styled-components";
import { useAtomValue } from "jotai";
import { selectedAddressAtom } from "../map/state/addressAtom";
import useCurrentAddress from "../map/hooks/useCurrentAddress";
import useMySummary from "./hooks/useMySummary";
import { pointsAtom } from "./convert/ConvertPointsContext";

export default function HelloSection() {
  const { data: summary } = useMySummary();

  // 전역 포인트 상태 사용
  const globalPoints = useAtomValue(pointsAtom);

  const selectedAddress = useAtomValue(selectedAddressAtom);
  const hasGlobalAddr = !!(selectedAddress?.jibunAddress || selectedAddress?.roadAddress);
  const { address: fallbackAddr } = useCurrentAddress(!hasGlobalAddr);
  const rawAddr =
    selectedAddress?.jibunAddress || selectedAddress?.roadAddress || fallbackAddr || "";
  const shortAddr = deriveGuDong(rawAddr);

  return (
    <HelloSectionWrapper>
      <HelloText>
        <NameHighlight>{summary?.nickname || ""}</NameHighlight>님 안녕하세요!
      </HelloText>
      <LocationText>{shortAddr || "위치 불러오는 중"}</LocationText>
    </HelloSectionWrapper>
  );
}

function deriveGuDong(addr = "") {
  if (!addr) return "";
  const m1 = addr.match(/([\w가-힣]+구)\s+([\w가-힣]+동)/);
  if (m1) return `${m1[1]} ${m1[2]}`;
  const m2 = addr.match(/([\w가-힣]+구)/);
  if (m2) return m2[1];
  return addr.split(/\s+/).filter(Boolean).slice(0, 2).join(" ");
}

const HelloSectionWrapper = styled.div`
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  background: #fbfbfb;
  padding: 0 10px 29px;
`;

const HelloText = styled.p`
  color: #1c1b1a;
  font-size: 24px;
  font-weight: 700;
  line-height: 28px;
`;

const NameHighlight = styled.span`
  color: #40c32f;
`;

const LocationText = styled.p`
  color: #787885;
  font-size: 16px;
  font-weight: 500;
  line-height: 28px;
`;
