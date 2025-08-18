import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { APIService } from "../../../shared/lib/api";

const PAGE_SIZE = 20;

export default function useFavoriteIngredients() {
  const qc = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ["favorites", "ingredients"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await APIService.private.get("/favorites/ingredients", {
        params: {
          page: pageParam,
          size: PAGE_SIZE,
          sort: "createdAt,desc",
        },
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

  // ✅ 찜 해제(낙관적 업데이트)
  const unfavoriteMutation = useMutation({
    mutationFn: async (ingredientId) => {
      const res = await APIService.private.delete("/favorites", {
        params: { type: "INGREDIENT", targetId: ingredientId },
      });
      return res?.data ?? res;
    },
    onMutate: async (ingredientId) => {
      await qc.cancelQueries({ queryKey: ["favorites", "ingredients"] });

      const previous = qc.getQueryData(["favorites", "ingredients"]);

      qc.setQueryData(["favorites", "ingredients"], (old) => {
        if (!old) return old;
        const pages = old.pages.map((p) => ({
          ...p,
          content: (p.content || []).filter((it) => it.ingredientId !== ingredientId),
          totalElements:
            typeof p.totalElements === "number" && p.totalElements > 0
              ? p.totalElements - 1
              : p.totalElements,
        }));
        return { ...old, pages };
      });

      return { previous };
    },
    onError: (_err, _ingredientId, ctx) => {
      if (ctx?.previous) qc.setQueryData(["favorites", "ingredients"], ctx.previous);
      alert("찜 해제에 실패했어. 잠시 후 다시 시도해줘");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["favorites", "ingredients"] });
    },
  });

  const ingredients = query.data?.pages.flatMap((p) => p.content) ?? [];
  const totalCount = query.data?.pages?.[0]?.totalElements ?? 0;

  return {
    ingredients,
    totalCount,
    loading: query.isLoading || query.isFetchingNextPage,
    error: query.isError ? query.error : null,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
    unfavorite: (id) => unfavoriteMutation.mutate(id),
    unfavoriteLoading: unfavoriteMutation.isLoading,
  };
}
