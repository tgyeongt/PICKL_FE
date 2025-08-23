import styled from "styled-components";
import { useAtomValue } from "jotai";
import { selectedAddressAtom } from "../map/state/addressAtom";
import useCurrentAddress from "../map/hooks/useCurrentAddress";
import useMySummary from "./hooks/useMySummary";

// 기본 위치 상수 (KakaoMap.jsx와 동일)
const DEFAULT_LOCATION = {
  lat: 37.5013, // 서울 서초구 강남대로 27 (강남역 근처)
  lng: 127.0254,
  name: "서울 서초구 강남대로 27",
};

export default function HelloSection() {
  const { data: summary } = useMySummary();

  const selectedAddress = useAtomValue(selectedAddressAtom);
  const { address: fallbackAddr, isLoading } = useCurrentAddress(true);

  // 디버깅: 각 값 확인
  console.log("[HelloSection] selectedAddress:", selectedAddress);
  console.log("[HelloSection] fallbackAddr:", fallbackAddr);
  console.log("[HelloSection] isLoading:", isLoading);

  // 현재위치를 못 읽으면 기본 위치 사용
  // selectedAddress에 실제 유효한 주소가 있을 때만 사용
  const hasValidSelectedAddress = selectedAddress?.jibunAddress || selectedAddress?.roadAddress;

  const rawAddr = hasValidSelectedAddress || fallbackAddr || DEFAULT_LOCATION.name;

  console.log("[HelloSection] hasValidSelectedAddress:", hasValidSelectedAddress);
  console.log("[HelloSection] rawAddr:", rawAddr);
  const shortAddr = deriveGuDong(rawAddr);
  console.log("[HelloSection] shortAddr:", shortAddr);

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
  padding: 50px 10px 29px;
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
