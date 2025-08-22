import { useSetAtom } from "jotai";
import { favoriteRecipesCountAtom } from "../state/favoriteRecipesCountAtom";
import useFavorites from "../../../shared/hooks/useFavorites";

export default function useFavoriteRecipes() {
  const setFavCount = useSetAtom(favoriteRecipesCountAtom);

  const result = useFavorites("RECIPE", {
    onCountChange: setFavCount,
  });

  // 기존 인터페이스와 호환되도록 매핑
  return {
    recipes: result.data,
    totalCount: result.totalCount,
    loading: result.loading,
    error: result.error,
    hasMore: result.hasMore,
    loadMore: result.loadMore,
    unfavorite: result.unfavorite,
    unfavoriteLoading: result.unfavoriteLoading,
  };
}
