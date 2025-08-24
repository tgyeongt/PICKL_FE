import styled from "styled-components";
import { useConvertPoints } from "./convert/ConvertPointsContext";
import { useAtomValue } from "jotai";
import { selectedAddressAtom } from "../map/state/addressAtom";
import useCurrentAddress from "../map/hooks/useCurrentAddress";

import seoulLove from "@icon/my/seoulLove.svg";
import seochoIcon from "@icon/my/seochoIcon.svg";

export default function ConvertTicketSection() {
  const { state, setVoucher } = useConvertPoints();
  const selectedAddress = useAtomValue(selectedAddressAtom);
  const selected = state?.selectedVoucher ?? "seoul";

  const deriveGuDong = (addr = "") => {
    const m1 = addr.match(/([\w가-힣]+구)\s+([\w가-힣]+동)/);
    if (m1) return `${m1[1]} ${m1[2]}`;
    const m2 = addr.match(/([\w가-힣]+구)/);
    if (m2) return m2[1];
    return addr.split(/\s+/).slice(0, 2).join(" ");
  };

  const hasGlobalAddr = !!(selectedAddress?.jibunAddress || selectedAddress?.roadAddress);
  const { address: fallbackAddr } = useCurrentAddress(!hasGlobalAddr);

  const rawAddr =
    selectedAddress?.jibunAddress || selectedAddress?.roadAddress || fallbackAddr || "";

  const shortAddr = deriveGuDong(rawAddr);

  const getCurrentDistrict = () => {
    const districtMatch = shortAddr.match(/([\w가-힣]+구)/);
    if (districtMatch) {
      console.log("District found:", districtMatch[0]);
      return districtMatch[0];
    }

    const cityMatch = shortAddr.match(/([\w가-힣]+시)/);
    if (cityMatch) {
      console.log("City found:", cityMatch[0]);
      return cityMatch[0];
    }

    console.log("No district or city found, using default");
    return "서초";
  };

  const currentDistrict = getCurrentDistrict();

  console.log("ConvertTicketSection Debug:", {
    selectedAddress,
    fallbackAddr,
    rawAddr,
    shortAddr,
    currentDistrict,
  });

  const TICKETS = [
    { key: "seoul", label: "서울사랑상품권", icon: seoulLove },
    { key: "seocho", label: `${currentDistrict}사랑상품권`, icon: seochoIcon },
  ];

  const handleSelect = (key) => {
    if (selected !== key) setVoucher(key);
  };

  return (
    <ConvertTicketSectionWrapper>
      <SectionTitle>전환할 상품권</SectionTitle>

      <Cards role="radiogroup" aria-label="전환할 상품권 선택">
        {TICKETS.map((t) => {
          const active = selected === t.key;
          return (
            <Card
              key={t.key}
              role="radio"
              aria-checked={active}
              $active={active}
              tabIndex={0}
              onClick={() => handleSelect(t.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleSelect(t.key);
              }}
            >
              <Left>
                <BrandIcon src={t.icon} alt="" />
                <Label $active={active}>{t.label}</Label>
              </Left>
              <Check $active={active} aria-hidden="true">
                <span>✓</span>
              </Check>
            </Card>
          );
        })}
      </Cards>
    </ConvertTicketSectionWrapper>
  );
}

const ConvertTicketSectionWrapper = styled.div`
  box-sizing: border-box;
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  background-color: #fbfbfb;
  margin-bottom: 62px;
`;

const SectionTitle = styled.p`
  color: #000;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  margin-bottom: 13px;
`;

const Cards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const Card = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;

  background: #fff;
  border: ${({ $active }) => ($active ? "1px solid #58D848" : "1px solid #ECEFF1")};
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(88, 216, 72, 0.25);
    outline: none;
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 27px;
`;

const BrandIcon = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 100%;
  background: #f2f2f4;
  object-fit: cover;
`;

const Label = styled.span`
  color: #000;
  text-align: center;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
`;

const Check = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: ${({ $active }) => ($active ? "#58D848" : "#9A9A9D")};
  border: ${({ $active }) => ($active ? "none" : "1px solid #D7D7DA")};

  span {
    color: ${({ $active }) => ($active ? "#fff" : "#fff")};
    font-size: 22px;
    line-height: 1;
    transform: translateY(-1px);
    font-weight: 900;
  }
`;
