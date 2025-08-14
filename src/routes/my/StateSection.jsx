import styled from "styled-components";
import useMySummary from "./hooks/useMySummary";

export default function StateSection() {
  const { data: summary } = useMySummary();
  const points = formatNumber(summary?.points ?? 0);
  const joinedDays = summary?.daysSinceFriend ?? 0;

  return (
    <SectionWrapper>
      <CardsSection>
        <StatCard>
          <Label>포인트</Label>
          <ValueRow>
            <ValueHighlight>{points}</ValueHighlight>
            <Unit> P</Unit>
          </ValueRow>
        </StatCard>

        <StatCard>
          <Label>피클이와 함께한 지</Label>
          <ValueRow>
            <ValueHighlight>{joinedDays}일</ValueHighlight>
            <Unit> 째</Unit>
          </ValueRow>
        </StatCard>
      </CardsSection>
    </SectionWrapper>
  );
}

function formatNumber(n) {
  try {
    return Number(n).toLocaleString();
  } catch {
    return n ?? "";
  }
}

const SectionWrapper = styled.section`
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  background: #fbfbfb;
  padding-bottom: 22px;
`;

const CardsSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 19px;
`;

const StatCard = styled.div`
  background: #eaeaed;
  border-radius: 15px;
  padding: 10px 16px;
  width: 160px;
  height: 70px;

  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
`;

const Label = styled.p`
  color: #787885;
  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;

const ValueRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 7px;
`;

const ValueHighlight = styled.span`
  color: #40c32f;
  font-family: Pretendard;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`;

const Unit = styled.span`
  color: #787885;
  font-family: Pretendard;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
`;
