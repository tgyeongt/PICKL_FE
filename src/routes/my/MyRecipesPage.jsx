import { useMemo, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSeasonIdByRecipe, upsertRecipeSeason } from "../../shared/lib/recipeSeasonMap";
import { useSetAtom } from "jotai";
import { useAtomValue } from "jotai";
import { favoriteRecipesCountAtom } from "./state/favoriteRecipesCountAtom";
import styled from "styled-components";
import useHeader from "../../shared/hooks/useHeader";
import useFavoriteRecipes from "./hooks/useFavoriteRecipes";
import recipeIconImg from "@icon/my/recipeIcon.svg";
import FavoriteItemCard from "./FavoriteItemCard";
import { AnimatePresence, motion } from "framer-motion";
import { APIService } from "../../shared/lib/api";

const FAV_RECIPE_PREFIX = "favorite:RECIPE:";
const countRecipeFavoritesFromLS = () => {
  try {
    const ls = window.localStorage;
    let c = 0;
    for (let i = 0; i < ls.length; i++) {
      const k = ls.key(i) || "";
      if (k.startsWith(FAV_RECIPE_PREFIX) && ls.getItem(k) === "true") c++;
    }
    return c;
  } catch {
    return 0;
  }
};

export default function MyRecipesPage() {
  useHeader({ title: "찜한 레시피 목록", showBack: true });

  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  const { recipes, loading, error, hasMore, loadMore, totalCount, unfavorite } =
    useFavoriteRecipes();

  const sentinelRef = useRef(null);
  const setFavCount = useSetAtom(favoriteRecipesCountAtom);
  const favCount = useAtomValue(favoriteRecipesCountAtom);

  useEffect(() => {
    const sync = () => setFavCount(countRecipeFavoritesFromLS());
    sync();
    window.addEventListener("storage", sync);

    const handleFavoriteChange = (event) => {
      const { type, id, willFavorite } = event.detail;
      if (type === "RECIPE" && !willFavorite) {
        try {
          const storageKey = `favorite:RECIPE:${id}`;

          window.localStorage.removeItem(storageKey);
        } catch (e) {
          // 로컬스토리지 제거 실패 시 무시
        }
      }
      sync();
    };

    window.addEventListener("favorite:change", handleFavoriteChange);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("favorite:change", handleFavoriteChange);
    };
  }, [setFavCount]);

  const handleCardClick = async (item) => {
    if (isNavigating) return;

    try {
      setIsNavigating(true);
      const rid = String(item.id);

      let seasonItemId = getSeasonIdByRecipe(rid);

      if (seasonItemId) {
        navigate(`/seasonal/${seasonItemId}/${rid}`);
        return;
      }

      try {
        const seasonItemsResponse = await APIService.private.get("/season-items");
        const seasonItems = seasonItemsResponse.data?.content || [];

        if (seasonItems.length === 0) {
          for (let i = 1; i <= 100; i++) {
            try {
              const recipesResponse = await APIService.private.get(`/season-items/${i}/recipes`);
              const recipes = recipesResponse.data || [];

              const foundRecipe = recipes.find((recipe) => String(recipe.id) === rid);
              if (foundRecipe) {
                seasonItemId = i;
                upsertRecipeSeason(rid, seasonItemId);
                break;
              }
            } catch (error) {
              continue;
            }
          }
        } else {
          for (const seasonItem of seasonItems) {
            try {
              const recipesResponse = await APIService.private.get(
                `/season-items/${seasonItem.id}/recipes`
              );
              const recipes = recipesResponse.data || [];

              const foundRecipe = recipes.find((recipe) => String(recipe.id) === rid);
              if (foundRecipe) {
                seasonItemId = seasonItem.id;
                upsertRecipeSeason(rid, seasonItemId);
                break;
              }
            } catch (error) {
              continue;
            }
          }
        }

        if (seasonItemId) {
          navigate(`/seasonal/${seasonItemId}/${rid}`);
          return;
        }
      } catch (error) {
        // Failed to find season item for recipe silently
      }

      alert("이 레시피의 상세 정보를 찾을 수 없습니다. 시즌 레시피에서 먼저 확인해주세요.");
    } catch (error) {
      alert("레시피로 이동하는 중 오류가 발생했습니다.");
    } finally {
      setIsNavigating(false);
    }
  };

  const items = useMemo(() => {
    return recipes.map((recipe) => ({
      id: recipe.recipeId,
      name: recipe.recipeName,
      img: recipeIconImg,
    }));
  }, [recipes]);

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
          총 <GreenText>{typeof favCount === "number" ? favCount : totalCount}</GreenText>개
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

                  try {
                    const storageKey = `favorite:RECIPE:${item.id}`;
                    window.localStorage.removeItem(storageKey);
                  } catch (e) {
                    // 로컬스토리지 제거 실패 시 무시
                  }
                  unfavorite(item.id);
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </Grid>

      <div ref={sentinelRef} />

      {loading && <LoadingText>추가 로딩 중...</LoadingText>}
    </MyRecipesPageWrapper>
  );
}

const MyRecipesPageWrapper = styled.div`
  min-height: 100vh;
  background: #fbfbfb;
  padding-top: 50px;
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
