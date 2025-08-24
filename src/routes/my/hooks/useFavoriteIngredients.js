import useFavorites from "../../../shared/hooks/useFavorites";

export default function useFavoriteIngredients() {
  const result = useFavorites("INGREDIENT");

  return {
    ingredients: result.data,
    loading: result.loading,
    error: result.error,
    hasMore: result.hasMore,
    loadMore: result.loadMore,
    unfavorite: result.unfavorite,
    unfavoriteLoading: result.unfavoriteLoading,
    localFavoriteIds: result.localFavoriteIds,
  };
}
