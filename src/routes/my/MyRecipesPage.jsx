import { useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getSeasonIdByRecipe } from "../../shared/lib/recipeSeasonMap";
import { useSetAtom } from "jotai";
import { favoriteRecipesCountAtom } from "./state/favoriteRecipesCountAtom";
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

  const sentinelRef = useRef(null);
  const setFavCount = useSetAtom(favoriteRecipesCountAtom);

  useEffect(() => {
    const next = typeof totalCount === "number" && totalCount >= 0 ? totalCount : recipes.length;
    setFavCount(next);
  }, [totalCount, recipes.length, setFavCount]);

  const handleCardClick = (item) => {
    const rid = String(item.id);
    const seasonItemId = getSeasonIdByRecipe(rid);
    if (seasonItemId) {
      navigate(`/seasonal/${seasonItemId}/${rid}`);
    } else {
      navigate(`/recipes/resolve/${rid}`);
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
    const node = sentinelRef.current;
    if (node) observer.observe(node);
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
          총 <GreenText>{totalCount}</GreenText>개
        </SubText>
      </CountRow>

      <Grid as={motion.div} layout>
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 12 }}
              transition={{ duration: 0.25 }}
            >
              <FavoriteItemCard
                img={item.img}
                title={item.name}
                liked={true}
                onClick={() => handleCardClick(item)}
                onClickHeart={(e) => {
                  e?.stopPropagation?.();
                  unfavorite(item.id);
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </Grid>

      {/* 무한스크롤 센티널 */}
      <div ref={sentinelRef} />

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
