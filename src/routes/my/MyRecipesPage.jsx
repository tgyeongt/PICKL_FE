import { useEffect, useRef, useMemo } from "react";
import styled from "styled-components";
import useHeader from "../../shared/hooks/useHeader";
import useFavoriteRecipes from "./hooks/useFavoriteRecipes";

import recipeIconImg from "@icon/my/recipeIcon.svg";
import FavoriteItemCard from "./FavoriteItemCard";

export default function MyRecipesPage() {
  useHeader({
    title: "찜한 레시피 목록",
    showBack: true,
  });

  const { recipes, loading, error, hasMore, loadMore, totalCount } = useFavoriteRecipes();
  const observerRef = useRef(null);

  const items = useMemo(
    () =>
      recipes.map((recipe) => ({
        id: recipe.recipeId,
        name: recipe.recipeName,
        img: recipeIconImg,
      })),
    [recipes]
  );

  // IntersectionObserver로 마지막 아이템 감지
  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [hasMore, loading, loadMore]);

  if (loading && items.length === 0) {
    return (
      <MyRecipesPageWrapper>
        <LoadingText>로딩 중...</LoadingText>
      </MyRecipesPageWrapper>
    );
  }

  if (error) {
    return (
      <MyRecipesPageWrapper>
        <ErrorText>데이터를 불러오는데 실패했습니다.</ErrorText>
      </MyRecipesPageWrapper>
    );
  }

  return (
    <MyRecipesPageWrapper>
      <CountRow>
        <SubText>
          총 <GreenText>{totalCount}개</GreenText>
        </SubText>
      </CountRow>

      <Grid>
        {items.map((item, idx) => (
          <FavoriteItemCard
            key={item.id}
            img={item.img}
            title={item.name}
            onClick={() => {}}
            // 마지막 카드에 ref 연결
            ref={idx === items.length - 1 ? observerRef : null}
          />
        ))}
      </Grid>

      {loading && <LoadingText>추가 로딩 중...</LoadingText>}
    </MyRecipesPageWrapper>
  );
}

const MyRecipesPageWrapper = styled.div`
  min-height: 100vh;
  background: #fbfbfb;
  padding-bottom: 90px;
`;
const CountRow = styled.div`
  max-width: 390px;
  margin: 6px auto 10px;
  padding: 0 20px;
  box-sizing: border-box;
`;
const SubText = styled.p`
  color: #adadaf;
  font-size: 12px;
`;
const GreenText = styled.span`
  color: #38b628;
  font-size: 12px;
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding: 0 20px 20px;
  max-width: 390px;
  margin: 0 auto;
`;
const LoadingText = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 14px;
`;
const ErrorText = styled.div`
  text-align: center;
  padding: 50px 20px;
  color: #ff4444;
  font-size: 16px;
`;
