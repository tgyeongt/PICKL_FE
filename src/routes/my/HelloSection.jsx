import styled from "styled-components";
import { useAtomValue } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { selectedAddressAtom } from "../map/state/addressAtom";
import { APIService } from "../../shared/lib/api";
import useCurrentAddress from "../map/hooks/useCurrentAddress";

export default function HelloSection() {
  // 이름: 백엔드 `/me`에서 가져오는 걸 기본으로 함
  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await APIService.private.get("/me");
      const raw = res?.data ?? res;
      return {
        displayName: raw?.displayName || raw?.nickname || raw?.name || "정시태근희망러",
      };
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  // 위치: jotai 전역 주소 우선, 없으면 카카오 역지오코딩 훅으로 보완
  const selectedAddress = useAtomValue(selectedAddressAtom);
  const hasGlobalAddr = !!(selectedAddress?.jibunAddress || selectedAddress?.roadAddress);
  const { address: fallbackAddr } = useCurrentAddress(!hasGlobalAddr);

  const rawAddr =
    selectedAddress?.jibunAddress || selectedAddress?.roadAddress || fallbackAddr || "";

  const shortAddr = deriveGuDong(rawAddr);

  return (
    <HelloSectionWrapper>
      <HelloText>
        <NameHighlight>{me?.displayName || "정시태근희망러"}</NameHighlight>님 안녕하세요!
      </HelloText>
      <LocationText>{shortAddr || "위치 불러오는 중"}</LocationText>
    </HelloSectionWrapper>
  );
}

// "서울 성북구 정릉동 123-4" → "성북구 정릉동"
// "서울 성북구 정릉로 12" 처럼 동이 없으면 "성북구"까지만
function deriveGuDong(addr = "") {
  if (!addr) return "";
  const m1 = addr.match(/([\w가-힣]+구)\s+([\w가-힣]+동)/);
  if (m1) return `${m1[1]} ${m1[2]}`;

  const m2 = addr.match(/([\w가-힣]+구)/);
  if (m2) return m2[1];

  const tokens = addr.split(/\s+/).filter(Boolean);
  return tokens.slice(0, 2).join(" ");
}

const HelloSectionWrapper = styled.div`
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  background: #fbfbfb;
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 29px;
`;

const HelloText = styled.p`
  color: #1c1b1a;
  font-family: Pretendard;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 28px;
`;

const NameHighlight = styled.span`
  color: #40c32f;
`;

const LocationText = styled.p`
  color: #787885;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 28px;
`;
