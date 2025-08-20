import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { APIService } from "../../../shared/lib/api";
import { emitFavoriteChange } from "../../../shared/lib/favoritesBus";

const PAGE_SIZE = 20;
const FAV_INGREDIENT_PREFIX = "favorite:INGREDIENT:";

// 로컬스토리지에서 찜한 식재료 ID 목록 가져오기
const getFavoriteIngredientIdsFromLS = () => {
  try {
    const ls = window.localStorage;
    const ids = [];
    for (let i = 0; i < ls.length; i++) {
      const k = ls.key(i) || "";
      if (k.startsWith(FAV_INGREDIENT_PREFIX) && ls.getItem(k) === "true") {
        const id = k.replace(FAV_INGREDIENT_PREFIX, "");
        ids.push(id);
      }
    }
    return ids;
  } catch {
    return [];
  }
};

// 더미 식재료 데이터 생성
const createDummyIngredients = (ids) => {
  return ids.map((id) => ({
    ingredientId: id,
    name: `식재료 ${id}`,
    thumbnailUrl: "https://via.placeholder.com/150x150?text=식재료",
  }));
};

export default function useFavoriteIngredients() {
  const qc = useQueryClient();

  // 로컬스토리지에서 찜한 식재료 ID 목록
  const favoriteIds = useMemo(() => getFavoriteIngredientIdsFromLS(), []);

  // 로컬스토리지 기반으로 더미 데이터 생성
  const localIngredients = useMemo(() => createDummyIngredients(favoriteIds), [favoriteIds]);

  const query = useInfiniteQuery({
    queryKey: ["favorites", "ingredients"],
    queryFn: async ({ pageParam = 0 }) => {
      try {
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
      } catch (error) {
        console.warn("API 호출 실패, 로컬스토리지 기반으로 대체:", error);
        // API 실패 시 로컬스토리지 기반으로 더미 데이터 생성
        return {
          content: localIngredients,
          totalElements: localIngredients.length,
          totalPages: 1,
          page: 0,
        };
      }
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined,
  });

  // ✅ 찜 해제(낙관적 업데이트)
  const unfavoriteMutation = useMutation({
    mutationFn: async (ingredientId) => {
      try {
        const res = await APIService.private.delete("/favorites", {
          params: { type: "INGREDIENT", targetId: ingredientId },
        });
        return res?.data ?? res;
      } catch (error) {
        console.warn("찜 해제 API 실패, 로컬스토리지만 업데이트:", error);
        // API 실패해도 로컬스토리지는 업데이트
        return { success: true };
      }
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
    onSuccess: (_res, ingredientId) => {
      console.log("[emit] 보내는 중:", {
        type: "INGREDIENT",
        id: ingredientId,
        willFavorite: false,
      });
      emitFavoriteChange({ type: "INGREDIENT", id: ingredientId, willFavorite: false });
      // ✅ 해제 성공 시 로컬 씨드 제거
      try {
        window.localStorage.removeItem(`favorite:INGREDIENT:${String(ingredientId)}`);
      } catch (e) {
        void e;
      }
    },
  });

  // API 데이터가 있으면 사용, 없으면 로컬스토리지 기반 데이터 사용
  // API 실패 시에도 localIngredients 사용
  const ingredients = query.data?.pages.flatMap((p) => p.content) ?? localIngredients;

  // API 실패 시에도 localIngredients 사용하도록 error 상태 무시
  const finalIngredients = query.isError ? localIngredients : ingredients;

  // ✅ 목록이 로드되면 각 식재료를 '찜됨' 씨드로 로컬에 기록
  useEffect(() => {
    if (!finalIngredients?.length) return;
    try {
      for (const it of finalIngredients) {
        const iid = String(it?.ingredientId ?? "");
        if (!iid) continue;
        window.localStorage.setItem(`favorite:INGREDIENT:${iid}`, "true");
      }
    } catch (e) {
      void e;
    }
  }, [finalIngredients]);

  return {
    ingredients: finalIngredients,
    loading: query.isLoading || query.isFetchingNextPage,
    error: null, // API 실패해도 에러 상태로 만들지 않음
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
    unfavorite: (id) => unfavoriteMutation.mutate(id),
    unfavoriteLoading: unfavoriteMutation.isLoading,
  };
}
