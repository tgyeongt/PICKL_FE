import styled from "styled-components";
import SuggestCard from "./SuggestCard";

export default function Suggestion({ onSelectItem }) {
  const keywordList = [
    { productNo: 411, title: "복숭아" },
    { productNo: 383, title: "멜론" },
    { productNo: 321, title: "토마토" },
  ];

  const seasonalList = [
    {
      productNo: 395,
      title: "새송이버섯",
      unit: "100g",
      img: "https://picklocal.s3.ap-northeast-2.amazonaws.com/images/2025/08/8ed68c0e-94c9-4762-ae9a-14b908617667",
      price: 545,
    },
    {
      productNo: 357,
      title: "깐마늘(국산)",
      unit: "1kg",
      img: "https://picklocal.s3.ap-northeast-2.amazonaws.com/images/2025/08/204434f0-a9d7-450c-b7fe-446537601f0f",
      price: 10449,
    },
    { productNo: 2109, title: "갈치/국산(냉장)(中)", unit: "1마리", img: "", price: 7464 },
  ];

  return (
    <>
      <RecommendedSection>
        <SubTitle>추천 검색어</SubTitle>
        <KeywordWrapper>
          {keywordList.map((item) => (
            <div
              key={item.productNo}
              className="keyword"
              onClick={() => onSelectItem(item.productNo)}
            >
              {item.title}
            </div>
          ))}
        </KeywordWrapper>
      </RecommendedSection>
      <TodaypickWrapper>
        <SubTitle>이달의 Pick</SubTitle>
        {seasonalList.map((item) => (
          <SuggestCard
            key={item.productNo}
            productNo={item.productNo}
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
