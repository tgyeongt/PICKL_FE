import styled from "styled-components";
import { useConvertPoints } from "./convert/ConvertPointsContext";

import seoulLove from "@icon/my/seoulLove.svg";
import seongbukLove from "@icon/my/sbLove.svg";

const TICKETS = [
  { key: "seoul", label: "서울사랑상품권", icon: seoulLove },
  { key: "seongbuk", label: "성북사랑상품권", icon: seongbukLove },
];

export default function ConvertTicketSection() {
  const { state, setVoucher } = useConvertPoints();
  const selected = state?.selectedVoucher ?? "seoul";

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
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  background-color: #fbfbfb;
  padding-right: 20px;
  padding-bottom: 62px;
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
