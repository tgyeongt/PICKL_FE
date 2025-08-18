import styled from "styled-components";
import ItemCard from "./ItemCard";

export default function Suggestion({ onSelectItem }) {
  const keywordList = [
    { id: 110, title: "복숭아" },
    { id: 181, title: "멜론" },
    { id: 7, title: "토마토" },
  ];

  const seasonalList = [
    {
      id: 57,
      title: "새송이버섯",
      unit: "100g",
      img: "https://picklocal.s3.ap-northeast-2.amazonaws.com/images/2025/08/8ed68c0e-94c9-4762-ae9a-14b908617667",
      price: 545,
    },
    {
      id: 20,
      title: "깐마늘(국산)",
      unit: "1kg",
      img: "https://picklocal.s3.ap-northeast-2.amazonaws.com/images/2025/08/204434f0-a9d7-450c-b7fe-446537601f0f",
      price: 10449,
    },
    { id: 91, title: "갈치/국산(냉장)(中)", unit: "1마리", img: "", price: 7464 },
  ];

  return (
    <>
      <RecommendedSection>
        <SubTitle>추천 검색어</SubTitle>
        <KeywordWrapper>
          {keywordList.map((item) => (
            <div key={item.id} className="keyword" onClick={() => onSelectItem(item.id)}>
              {item.title}
            </div>
          ))}
        </KeywordWrapper>
      </RecommendedSection>
      <TodaypickWrapper>
        <SubTitle>이달의 Pick</SubTitle>
        {seasonalList.map((item) => (
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
    text-align: center;
    justify-content: center;
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
