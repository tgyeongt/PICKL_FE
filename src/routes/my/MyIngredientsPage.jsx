import { useMemo } from "react";
import styled from "styled-components";
import useHeader from "../../shared/hooks/useHeader";
import useFavoriteIngredients from "./hooks/useFavoriteIngredients";

import watermelonImg from "@icon/home/watermelon.png";
import FavoriteItemCard from "./FavoriteItemCard";

export default function MyIngredientsPage() {
  useHeader({
    title: "찜한 식재료 목록",
    showBack: true,
  });

  const { ingredients, loading, error, hasMore, loadMore, totalCount } = useFavoriteIngredients();

  // API 응답 데이터를 컴포넌트에서 사용할 수 있는 형태로 변환
  const items = useMemo(() => {
    // ingredients가 배열인지 확인하고, 아니면 빈 배열로 처리
    const ingredientsArray = Array.isArray(ingredients) ? ingredients : [];

    return ingredientsArray.map((ingredient) => ({
      id: ingredient.ingredientId,
      name: ingredient.name,
      description: ingredient.shortDesc || "맛있는 식재료입니다",
      img: ingredient.thumbnailUrl || watermelonImg, // 썸네일이 없으면 기본 이미지 사용
    }));
  }, [ingredients]);

  // 총 개수 표시 (API에서 받은 totalCount 사용)
  const displayCount = totalCount;

  if (loading && items.length === 0) {
    return (
      <MyIngredientsPageWrapper>
        <LoadingText>로딩 중...</LoadingText>
      </MyIngredientsPageWrapper>
    );
  }

  if (error) {
    return (
      <MyIngredientsPageWrapper>
        <ErrorText>데이터를 불러오는데 실패했습니다.</ErrorText>
      </MyIngredientsPageWrapper>
    );
  }

  return (
    <MyIngredientsPageWrapper>
      <CountRow>
        <SubText>
          총 <GreenText>{displayCount}개</GreenText>
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

      {hasMore && (
        <LoadMoreButton onClick={loadMore} disabled={loading}>
          {loading ? "로딩 중..." : "더 보기"}
        </LoadMoreButton>
      )}
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

const LoadingText = styled.div`
  text-align: center;
  padding: 50px 20px;
  color: #666;
  font-size: 16px;
`;

const ErrorText = styled.div`
  text-align: center;
  padding: 50px 20px;
  color: #ff4444;
  font-size: 16px;
`;

const LoadMoreButton = styled.button`
  display: block;
  width: 200px;
  margin: 20px auto;
  padding: 12px 24px;
  background: #38b628;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #2d8f1f;
  }
`;
