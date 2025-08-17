import styled from "styled-components";
import { useEffect, useState } from "react";
import { APIService } from "../../shared/lib/api";
import ItemCard from "./ItemCard";

export default function Suggestion({ onSelectItem }) {
  const keywordList = [
    { id: 4, title: "감자" },
    { id: 2, title: "양파" },
    { id: 3, title: "토마토" },
  ];

  const [seasonalList, setSeasonalList] = useState([]);

  useEffect(() => {
    async function fetchSeasonItems() {
      try {
        const res = await APIService.private.get("/season-items");
        setSeasonalList(res.data);
      } catch (error) {
        console.error("Failed to fetch season items:", error);
      }
    }
    fetchSeasonItems();
  }, []);

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
            title={item.itemname}
            unit={item.unit}
            img={item.imageUrl}
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
