import { useEffect } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { APIService } from "../../../shared/lib/api";
import { emitFavoriteChange } from "../../../shared/lib/favoritesBus";
import { useSetAtom } from "jotai";
import { favoriteRecipesCountAtom } from "../state/favoriteRecipesCountAtom";

const PAGE_SIZE = 20;

export default function useFavoriteRecipes() {
  const qc = useQueryClient();
  const setFavCount = useSetAtom(favoriteRecipesCountAtom);

  const query = useInfiniteQuery({
    queryKey: ["favorites", "recipes"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await APIService.private.get("/favorites/recipes", {
        params: { page: pageParam, size: PAGE_SIZE, sort: "createdAt,desc" },
      });
      const data = res?.data ?? {};
      return {
        content: data.content || [],
        totalElements: data.totalElements ?? 0,
        totalPages: data.totalPages ?? 1,
        page: data.number ?? pageParam,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined,
  });

  const unfavoriteMutation = useMutation({
    mutationFn: async (recipeId) => {
      const res = await APIService.private.delete("/favorites", {
        params: { type: "RECIPE", targetId: recipeId },
      });
      return res?.data ?? res;
    },
    onMutate: async (recipeId) => {
      await qc.cancelQueries({ queryKey: ["favorites", "recipes"] });

      const previous = qc.getQueryData(["favorites", "recipes"]);

      qc.setQueryData(["favorites", "recipes"], (old) => {
        if (!old) return old;
        const pages = old.pages.map((p, idx) => ({
          ...p,
          content: (p.content || []).filter((it) => String(it.recipeId) !== String(recipeId)),
          totalElements:
            idx === 0 && typeof p.totalElements === "number" && p.totalElements > 0
              ? p.totalElements - 1
              : p.totalElements,
        }));
        return { ...old, pages };
      });

      setFavCount((prev) => Math.max(0, (typeof prev === "number" ? prev : 0) - 1));

      return { previous };
    },
    onError: (_err, _recipeId, ctx) => {
      if (ctx?.previous) qc.setQueryData(["favorites", "recipes"], ctx.previous);
      setFavCount((prev) => (typeof prev === "number" ? prev + 1 : prev));
      alert("찜 해제에 실패했어. 잠시 후 다시 시도해줘");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["favorites", "recipes"] });
    },
    onSuccess: (_res, recipeId) => {
      console.log("[emit] 보내는 중:", { type: "RECIPE", id: recipeId, willFavorite: false });
      emitFavoriteChange({ type: "RECIPE", id: recipeId, willFavorite: false });
    },
  });

  const recipes = query.data?.pages.flatMap((p) => p.content) ?? [];
  const totalCount = query.data?.pages?.[0]?.totalElements ?? recipes.length;

  useEffect(() => {
    setFavCount(typeof totalCount === "number" && totalCount >= 0 ? totalCount : recipes.length);
  }, [totalCount, recipes.length, setFavCount]);

  return {
    recipes,
    totalCount,
    loading: query.isLoading || query.isFetchingNextPage,
    error: query.isError ? query.error : null,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
    unfavorite: (id) => unfavoriteMutation.mutate(id),
    unfavoriteLoading: unfavoriteMutation.isLoading,
  };
}
