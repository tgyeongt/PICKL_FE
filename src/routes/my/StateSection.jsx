import styled from "styled-components";
import useMySummary from "./hooks/useMySummary";
import { useAtomValue } from "jotai";
import { pointsAtom } from "./convert/ConvertPointsContext";

export default function StateSection() {
  const { data: summary, isLoading, error } = useMySummary();

  // 전역 포인트 상태 사용
  const globalPoints = useAtomValue(pointsAtom);

  const currentPoints = summary?.points ?? null ?? globalPoints ?? 0;

  const points = formatNumber(currentPoints);
  const joinedDays = summary?.daysSinceFriend ?? 0;

  // 디버깅을 위한 로깅
  console.log("🔍 StateSection - Summary:", summary);
  console.log("🔍 StateSection - Global Points:", globalPoints);
  console.log("🔍 StateSection - Current Points:", currentPoints);
  console.log("🔍 StateSection - Points:", points);
  console.log("🔍 StateSection - Loading:", isLoading);
  console.log("🔍 StateSection - Error:", error);

  if (isLoading) {
    return (
      <SectionWrapper>
        <CardsSection>
          <StatCard>
            <Label>포인트</Label>
            <ValueRow>
              <ValueHighlight>로딩 중...</ValueHighlight>
            </ValueRow>
          </StatCard>
        </CardsSection>
      </SectionWrapper>
    );
  }

  if (error) {
    return (
      <SectionWrapper>
        <CardsSection>
          <StatCard>
            <Label>포인트</Label>
            <ValueRow>
              <ValueHighlight style={{ color: "red" }}>에러 발생</ValueHighlight>
            </ValueRow>
          </StatCard>
        </CardsSection>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper>
      <CardsSection>
        <StatCard>
          <Label>포인트</Label>
          <ValueRow>
            <ValueHighlight>{points}</ValueHighlight>
            <Unit> P</Unit>
          </ValueRow>
          {points === "0" && (
            <div style={{ fontSize: "10px", color: "red", marginTop: "5px" }}>
              포인트가 0입니다. API 응답을 확인해주세요.
            </div>
          )}
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
