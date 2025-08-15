import { useMemo } from "react";
import styled from "styled-components";
import useHeader from "../../shared/hooks/useHeader";

import recipeIconImg from "@icon/my/recipeIcon.svg";
import FavoriteItemCard from "./FavoriteItemCard";

export default function MyIngredientsPage() {
  useHeader({
    title: "찜한 레시피 목록",
    showBack: true,
  });

  // TODO: API 연동 준비 전까지 임시 더미 데이터
  const items = useMemo(
    () => [
      {
        id: 1,
        name: "통옥수수찜",
        img: recipeIconImg,
      },
      {
        id: 2,
        name: "토마토 파스타",
        img: recipeIconImg,
      },
      {
        id: 3,
        name: "수육",
        img: recipeIconImg,
      },
      {
        id: 4,
        name: "짜파구리",
        img: recipeIconImg,
      },
      {
        id: 5,
        name: "제육볶음",
        img: recipeIconImg,
      },
      {
        id: 6,
        name: "알리오 올리오",
        img: recipeIconImg,
      },
    ],
    []
  );

  return (
    <MyIngredientsPageWrapper>
      <CountRow>
        <SubText>
          총 <GreenText>{items.length}개</GreenText>
        </SubText>
      </CountRow>

      <Grid>
        {items.map((item) => (
          <FavoriteItemCard key={item.id} img={item.img} title={item.name} onClick={() => {}} />
        ))}
      </Grid>
    </MyIngredientsPageWrapper>
  );
}

const MyIngredientsPageWrapper = styled.div`
  min-height: 100vh;
  background: #fbfbfb;
  padding-bottom: 90px;
`;

const CountRow = styled.div`
  max-width: 390px;
  margin: 6px auto 10px;
  padding: 0 20px;
  box-sizing: border-box;
  .count {
    color: #58d848;
    font-size: 12px;
    font-weight: 700;
  }
`;

const SubText = styled.p`
  color: #adadaf;
  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;

const GreenText = styled.span`
  color: #38b628;
  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding: 0 20px 20px;
  box-sizing: border-box;
  max-width: 390px;
  margin: 0 auto;
`;
