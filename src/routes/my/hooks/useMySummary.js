import { useQuery } from "@tanstack/react-query";
import { APIService } from "../../../shared/lib/api";
import { testLoginIfNeeded } from "../../../shared/lib/auth";

function toNumSafe(v, fallback = 0) {
  if (v === null || v === undefined) return fallback;
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : fallback;
}

function mapSummary(box) {
  const raw = box?.data ?? box ?? {};
  const data = raw?.data ?? raw ?? {};
  const counts = data.counts ?? data.activityCounts ?? {};

  return {
    nickname: data.nickname ?? data.displayName ?? data.name ?? "",
    region: data.region ?? "",
    points: toNumSafe(data.points, 0),
    daysSinceFriend: toNumSafe(data.daysSinceFriend, 0),
    favoriteIngredientCount:
      [
        data.favoriteIngredientCount,
        data.favoriteIngredientsCount,
        data.ingredientsFavoriteCount,
        data.likedIngredientCount,
        counts.ingredients,
      ]
        .map((v) => toNumSafe(v, NaN))
        .find((v) => Number.isFinite(v)) ?? 0,
    favoriteRecipeCount:
      [
        data.favoriteRecipeCount,
        data.favoriteRecipesCount,
        data.recipesFavoriteCount,
        data.likedRecipeCount,
        counts.recipes,
      ]
        .map((v) => toNumSafe(v, NaN))
        .find((v) => Number.isFinite(v)) ?? 0,
    pickleHistoryCount:
      [
        data.pickleHistoryCount,
        data.historyCount,
        data.activityHistoryCount,
        counts.history,
        counts.pickleHistory,
      ]
        .map((v) => toNumSafe(v, NaN))
        .find((v) => Number.isFinite(v)) ?? 0,
  };
}

export default function useMySummary(options = {}) {
  return useQuery({
    queryKey: ["me", "summary"],
    queryFn: async () => {
      await testLoginIfNeeded();
      const res = await APIService.private.get("/users/me/summary");
      return mapSummary(res?.data ?? res);
    },
    staleTime: 0, // 항상 최신 데이터 가져오기
    refetchOnMount: true, // 마운트 시마다 새로 가져오기
    refetchOnWindowFocus: true, // 윈도우 포커스 시 새로 가져오기
    retry: 1,
    ...options,
  });
}
