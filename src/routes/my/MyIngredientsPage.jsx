import { useMemo } from "react";
import styled from "styled-components";
import useHeader from "../../shared/hooks/useHeader";

import watermelonImg from "@icon/home/watermelon.png";
import FavoriteItemCard from "./FavoriteItemCard";

export default function MyIngredientsPage() {
  useHeader({
    title: "찜한 식재료 목록",
    showBack: true,
  });

  // TODO: API 연동 준비 전까지 임시 더미 데이터
  const items = useMemo(
    () => [
      {
        id: 1,
        name: "수박",
        description: "쫄깃한 식감으로 입맛을 사로잡는 제철 해산물, 문어를 챙겨보세요",
        img: watermelonImg,
      },
      {
        id: 2,
        name: "참외",
        description: "쫄깃한 식감으로 입맛을 사로잡는 제철 해산물, 문어를 챙겨보세요",
        img: watermelonImg,
      },
      {
        id: 3,
        name: "문어",
        description: "쫄깃한 식감으로 입맛을 사로잡는 제철 해산물, 문어를 챙겨보세요",
        img: watermelonImg,
      },
      {
        id: 4,
        name: "토마토",
        description: "쫄깃한 식감으로 입맛을 사로잡는 제철 해산물, 문어를 챙겨보세요",
        img: watermelonImg,
      },
      {
        id: 5,
        name: "호박",
        description: "쫄깃한 식감으로 입맛을 사로잡는 제철 해산물, 문어를 챙겨보세요",
        img: watermelonImg,
      },
      {
        id: 6,
        name: "딸기",
        description: "쫄깃한 식감으로 입맛을 사로잡는 제철 해산물, 문어를 챙겨보세요",
        img: watermelonImg,
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
          <FavoriteItemCard
            key={item.id}
            img={item.img}
            title={item.name}
            description={item.description}
            onClick={() => {}}
          />
        ))}
      </Grid>
    </MyIngredientsPageWrapper>
  );
}

const MyIngredientsPageWrapper = styled.div`
  min-height: 100vh;
  background: #fbfbfb;
  padding-bottom: 90px; /* 하단 네비게이션 여백 */
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
