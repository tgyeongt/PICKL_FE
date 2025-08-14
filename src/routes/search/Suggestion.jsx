import styled from "styled-components";
import ItemCard from "./ItemCard";
import sampleItems from "./sampleItems";

export default function Suggestion() {
  return (
    <>
      <RecommendedSection>
        <SubTitle>추천 검색어</SubTitle>
        <KeywordWrapper>
          <div className="keyword">쌀</div>
          <div className="keyword">사과</div>
          <div className="keyword">포도</div>
          <div className="keyword">수박</div>
        </KeywordWrapper>
      </RecommendedSection>
      <TodaypickWrapper>
        <SubTitle>오늘 Pick</SubTitle>
        {sampleItems.map((item) => (
          <ItemCard
            key={item.id}
            id={item.id}
            title={item.title}
            unit={item.unit}
            img={item.img}
            price={item.price}
          />
        ))}
      </TodaypickWrapper>
    </>
  );
}

const RecommendedSection = styled.div`
  margin: 25px 0;
`;

const SubTitle = styled.p`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  margin-left: 3px;
`;

const KeywordWrapper = styled.div`
  display: flex;
  gap: 10px;

  .keyword {
    padding: 3px 20px;
    color: #5a5b6a;
    background-color: #eaeaed;
    border-radius: 15px;
    font-size: 14px;
    font-weight: 500;
  }
`;

const TodaypickWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 30px;

  .title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 15px;
    margin-left: 8px;
  }
`;
