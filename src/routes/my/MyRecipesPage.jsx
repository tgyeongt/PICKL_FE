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
    // 같은 탭 반영: 간단히 setTimeout 폴링 0ms도 가능하지만, 필요 없으면 생략해도 OK
    window.addEventListener("favorite:change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("favorite:change", sync);
    };
  }, [setFavCount]);

  const handleCardClick = async (item) => {
    if (isNavigating) return; // 이미 네비게이션 중이면 중복 클릭 방지

    try {
      setIsNavigating(true);
      const rid = String(item.id);
      console.log("클릭된 레시피 ID:", rid);

      // 먼저 캐시된 seasonItemId를 확인
      let seasonItemId = getSeasonIdByRecipe(rid);
      console.log("캐시된 seasonItemId:", seasonItemId);

      if (seasonItemId) {
        // 캐시에 있는 경우 해당 경로로 이동
        console.log("캐시된 정보로 이동:", `/seasonal/${seasonItemId}/${rid}`);
        navigate(`/seasonal/${seasonItemId}/${rid}`);
        return;
      }

      // 캐시에 없는 경우 직접 API에서 찾기
      console.log("캐시에 없음, API에서 찾기 시작...");
      try {
        // 시즌 아이템 목록을 가져와서 해당 레시피가 있는지 확인
        const seasonItemsResponse = await APIService.private.get("/season-items");
        const seasonItems = seasonItemsResponse.data?.content || [];
        console.log("시즌 아이템 개수:", seasonItems.length);

        // 시즌 아이템이 없는 경우 다른 방법 시도
        if (seasonItems.length === 0) {
          console.log("시즌 아이템이 없음, 다른 방법 시도...");

          // 직접 레시피 정보를 가져와보기
          // 먼저 1부터 100까지의 ID로 시도 (일반적인 범위)
          for (let i = 1; i <= 100; i++) {
            try {
              const recipesResponse = await APIService.private.get(`/season-items/${i}/recipes`);
              const recipes = recipesResponse.data || [];

              const foundRecipe = recipes.find((recipe) => String(recipe.id) === rid);
              if (foundRecipe) {
                seasonItemId = i;
                console.log("레시피 찾음! seasonItemId:", seasonItemId);
                // 캐시에 저장
                upsertRecipeSeason(rid, seasonItemId);
                break;
              }
            } catch (error) {
              // 해당 ID가 존재하지 않는 경우 무시하고 계속
              continue;
            }
          }
        } else {
          // 기존 로직
          for (const seasonItem of seasonItems) {
            try {
              console.log(`시즌 아이템 ${seasonItem.id}의 레시피 확인 중...`);
              const recipesResponse = await APIService.private.get(
                `/season-items/${seasonItem.id}/recipes`
              );
              const recipes = recipesResponse.data || [];
              console.log(`시즌 아이템 ${seasonItem.id}의 레시피 개수:`, recipes.length);

              const foundRecipe = recipes.find((recipe) => String(recipe.id) === rid);
              if (foundRecipe) {
                seasonItemId = seasonItem.id;
                console.log("레시피 찾음! seasonItemId:", seasonItemId);
                // 캐시에 저장
                upsertRecipeSeason(rid, seasonItemId);
                break;
              }
            } catch (error) {
              console.warn(`Failed to fetch recipes for season item ${seasonItem.id}:`, error);
              continue;
            }
          }
        }

        if (seasonItemId) {
          // 찾은 경우 해당 경로로 이동
          console.log("찾은 seasonItemId로 이동:", `/seasonal/${seasonItemId}/${rid}`);
          navigate(`/seasonal/${seasonItemId}/${rid}`);
          return;
        }
      } catch (error) {
        console.error("Failed to find season item for recipe:", error);
      }

      // 여전히 찾을 수 없는 경우 사용자에게 알림
      console.log("seasonItemId를 찾을 수 없음");
      alert("이 레시피의 상세 정보를 찾을 수 없습니다. 시즌 레시피에서 먼저 확인해주세요.");
    } catch (error) {
      console.error("Failed to navigate to recipe:", error);
      alert("레시피로 이동하는 중 오류가 발생했습니다.");
    } finally {
      setIsNavigating(false);
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
