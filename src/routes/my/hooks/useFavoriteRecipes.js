// src/routes/my/hooks/useFavoriteRecipes.js
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { APIService } from "../../../shared/lib/api";

const PAGE_SIZE = 20;

export default function useFavoriteRecipes() {
  const qc = useQueryClient();

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

  // ✅ 찜 해제(낙관적 업데이트로 즉시 카드 제거)
  const unfavoriteMutation = useMutation({
    mutationFn: async (recipeId) => {
      const res = await APIService.private.delete("/favorites", {
        params: { type: "RECIPE", targetId: recipeId },
      });
      return res?.data ?? res;
    },
    onMutate: async (recipeId) => {
      // 기존 요청 취소
      await qc.cancelQueries({ queryKey: ["favorites", "recipes"] });

      // 이전 스냅샷 저장
      const previous = qc.getQueryData(["favorites", "recipes"]);

      // 캐시에서 해당 아이템 제거
      qc.setQueryData(["favorites", "recipes"], (old) => {
        if (!old) return old;
        // old는 useInfiniteQuery의 데이터 셰이프를 따름
        const pages = old.pages.map((p) => ({
          ...p,
          content: (p.content || []).filter((it) => it.recipeId !== recipeId),
          // totalElements는 대략적으로 감소시켜 UX만 맞춤
          totalElements:
            typeof p.totalElements === "number" && p.totalElements > 0
              ? p.totalElements - 1
              : p.totalElements,
        }));
        return { ...old, pages };
      });

      // 롤백용 컨텍스트 반환
      return { previous };
    },
    onError: (_err, _recipeId, ctx) => {
      // 실패 시 롤백
      if (ctx?.previous) qc.setQueryData(["favorites", "recipes"], ctx.previous);
      alert("찜 해제에 실패했어. 잠시 후 다시 시도해줘");
    },
    onSettled: () => {
      // 서버 정합성 보장을 위해 최종 invalidate
      qc.invalidateQueries({ queryKey: ["favorites", "recipes"] });
    },
  });

  const recipes = query.data?.pages.flatMap((p) => p.content) ?? [];
  const totalCount = query.data?.pages?.[0]?.totalElements ?? 0;

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
