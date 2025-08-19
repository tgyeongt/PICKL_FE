import { useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getSeasonIdByRecipe } from "../../shared/lib/recipeSeasonMap";
import styled from "styled-components";
import useHeader from "../../shared/hooks/useHeader";
import useFavoriteRecipes from "./hooks/useFavoriteRecipes";
import recipeIconImg from "@icon/my/recipeIcon.svg";
import FavoriteItemCard from "./FavoriteItemCard";
import { AnimatePresence, motion } from "framer-motion";

export default function MyRecipesPage() {
  useHeader({ title: "찜한 레시피 목록", showBack: true });

  const navigate = useNavigate();
  const { recipes, loading, error, hasMore, loadMore, totalCount, unfavorite } =
    useFavoriteRecipes();
  const observerRef = useRef(null);

  const handleCardClick = (item) => {
    const seasonItemId = getSeasonIdByRecipe(item.id);
    if (seasonItemId) {
      // ✅ 캐시에 있으면 즉시 상세 이동
      navigate(`/seasonal/${seasonItemId}/${item.id}`);
    } else {
      // ✅ 캐시가 없으면 리졸버 경유
      navigate(`/recipes/resolve/${item.id}`);
    }
  };

  const items = useMemo(
    () =>
      recipes.map((recipe) => ({
        id: recipe.recipeId,
        name: recipe.recipeName,
        img: recipeIconImg, // 필요 시 recipe.thumbnail 등으로 교체
      })),
    [recipes]
  );

  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { threshold: 1.0 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
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
        <ErrorText>데이터를 불러오는데 실패했어</ErrorText>
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

      <Grid as={motion.div} layout>
        <AnimatePresence>
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 12 }}
              transition={{ duration: 0.25 }}
              ref={idx === items.length - 1 ? observerRef : null}
            >
              <FavoriteItemCard
                img={item.img}
                title={item.name}
                liked={true}
                onClick={() => handleCardClick(item)}
                onClickHeart={(e) => {
                  e?.stopPropagation?.(); // ✅ 카드 클릭으로 전파 방지
                  unfavorite(item.id);
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
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
