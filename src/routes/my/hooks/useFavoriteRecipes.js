import { useSetAtom } from "jotai";
import { favoriteRecipesCountAtom } from "../state/favoriteRecipesCountAtom";
import useFavorites from "../../../shared/hooks/useFavorites";

export default function useFavoriteRecipes() {
  const setFavCount = useSetAtom(favoriteRecipesCountAtom);

  const result = useFavorites("RECIPE", {
    onCountChange: setFavCount,
  });

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
