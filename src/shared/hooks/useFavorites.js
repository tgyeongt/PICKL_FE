import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { APIService } from "../lib/api";
import { emitFavoriteChange } from "../lib/favoritesBus";

const PAGE_SIZE = 20;

// 로컬스토리지에서 찜한 항목 ID 목록 가져오기
const getFavoriteIdsFromLS = (prefix) => {
  try {
    const ls = window.localStorage;
    const ids = [];
    for (let i = 0; i < ls.length; i++) {
      const k = ls.key(i) || "";
      if (k.startsWith(prefix) && ls.getItem(k) === "true") {
        const id = k.replace(prefix, "");
        ids.push(id);
      }
    }
    return ids;
  } catch {
    return [];
  }
};

export default function useFavorites(type, options = {}) {
  const { onCountChange, idField = type === "INGREDIENT" ? "ingredientId" : "recipeId" } = options;

  const qc = useQueryClient();
  const prefix = `favorite:${type}:`;

  // 로컬스토리지 상태를 실시간으로 추적
  const [localFavoriteIds, setLocalFavoriteIds] = useState(() => getFavoriteIdsFromLS(prefix));

  // 로컬스토리지 변경 감지
  useEffect(() => {
    const handleStorageChange = () => {
      setLocalFavoriteIds(getFavoriteIdsFromLS(prefix));
    };

    const handleFavoriteChange = (event) => {
      if (event.detail?.type === type) {
        setLocalFavoriteIds(getFavoriteIdsFromLS(prefix));
      }
    };

    // storage 이벤트 리스너 (다른 탭에서의 변경 감지)
    window.addEventListener("storage", handleStorageChange);

    // custom 이벤트 리스너 (같은 탭에서의 변경 감지)
    window.addEventListener("favorite:change", handleFavoriteChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("favorite:change", handleFavoriteChange);
    };
  }, [prefix, type]);

  const query = useInfiniteQuery({
    queryKey: ["favorites", type.toLowerCase()],
    queryFn: async ({ pageParam = 0 }) => {
      // 식재료인 경우 로컬스토리지 기반으로 직접 데이터 가져오기
      if (type === "INGREDIENT") {
        const favoriteIds = getFavoriteIdsFromLS(prefix);
        console.log("로컬스토리지에서 가져온 찜한 식재료 ID들:", favoriteIds);

        if (favoriteIds.length === 0) {
          return {
            content: [],
            totalElements: 0,
            totalPages: 1,
            page: pageParam,
          };
        }

        // 페이지네이션 처리
        const startIndex = pageParam * PAGE_SIZE;
        const endIndex = startIndex + PAGE_SIZE;
        const pageIds = favoriteIds.slice(startIndex, endIndex);

        console.log(`페이지 ${pageParam}: ${startIndex}-${endIndex}`, pageIds);

        // 각 ID에 대해 식재료 정보 가져오기
        const ingredients = [];
        for (const id of pageIds) {
          try {
            const res = await APIService.private.get(`/daily-price-change/store/items/${id}`);
            console.log(`식재료 ID ${id} API 응답:`, res.data);

            if (res.data) {
              // API 응답에서 이미지 URL 찾기
              let imageUrl = null;
              if (res.data.imageUrl) {
                imageUrl = res.data.imageUrl;
              } else if (res.data.image) {
                imageUrl = res.data.image;
              } else if (res.data.img) {
                imageUrl = res.data.img;
              } else if (res.data.thumbnailUrl) {
                imageUrl = res.data.thumbnailUrl;
              } else if (res.data.thumbnail) {
                imageUrl = res.data.thumbnail;
              }

              console.log(`식재료 ID ${id} 이미지 URL:`, imageUrl);

              // API 응답을 ingredients 형식에 맞게 변환
              const ingredient = {
                ingredientId: id,
                name: res.data.productName || res.data.name || `식재료 ${id}`,
                thumbnailUrl: imageUrl || "/default-ingredient-image.svg", // 기본 이미지 설정
                // 필요한 다른 필드들도 추가
              };
              ingredients.push(ingredient);
            }
          } catch (error) {
            console.warn(`식재료 ID ${id} 정보 가져오기 실패:`, error);
            // 실패한 경우에도 기본 정보로 추가
            ingredients.push({
              ingredientId: id,
              name: `식재료 ${id}`,
              thumbnailUrl: "/default-ingredient-image.svg",
            });
          }
        }

        return {
          content: ingredients,
          totalElements: favoriteIds.length,
          totalPages: Math.ceil(favoriteIds.length / PAGE_SIZE),
          page: pageParam,
        };
      }

      // 레시피는 기존 API 사용
      const endpoint = "recipes";
      const res = await APIService.private.get(`/favorites/${endpoint}`, {
        params: {
          page: pageParam,
          size: PAGE_SIZE,
          sort: "createdAt,desc",
        },
      });

      const data = res?.data ?? {};

      // API 응답 데이터 로깅
      console.log(`=== ${type} API 응답 데이터 ===`);
      console.log("전체 응답:", res);
      console.log("데이터:", data);
      console.log("컨텐츠:", data.content);
      if (data.content && data.content.length > 0) {
        console.log("첫 번째 항목:", data.content[0]);
      }

      return {
        content: data.content || [],
        totalElements: data.totalElements ?? 0,
        totalPages: data.totalPages ?? 1,
        page: data.number ?? pageParam,
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages - 1 ? lastPage.page + 1 : undefined,
    enabled: true,
  });

  // 로컬스토리지 데이터가 변경될 때 쿼리 무효화
  useEffect(() => {
    if (query.data) {
      qc.invalidateQueries({ queryKey: ["favorites", type.toLowerCase()] });
    }
  }, [localFavoriteIds, qc, query.data, type]);

  // 찜 해제(낙관적 업데이트)
  const unfavoriteMutation = useMutation({
    mutationFn: async (itemId) => {
      const res = await APIService.private.delete("/favorites", {
        params: { type, targetId: itemId },
      });
      return res?.data ?? res;
    },
    onMutate: async (itemId) => {
      await qc.cancelQueries({ queryKey: ["favorites", type.toLowerCase()] });

      const previous = qc.getQueryData(["favorites", type.toLowerCase()]);

      // 낙관적 업데이트
      qc.setQueryData(["favorites", type.toLowerCase()], (old) => {
        if (!old) return old;
        const pages = old.pages.map((p, idx) => ({
          ...p,
          content: (p.content || []).filter((it) => String(it[idField]) !== String(itemId)),
          totalElements:
            idx === 0 && typeof p.totalElements === "number" && p.totalElements > 0
              ? p.totalElements - 1
              : p.totalElements,
        }));
        return { ...old, pages };
      });

      // 개수 업데이트
      if (onCountChange) {
        onCountChange((prev) => Math.max(0, (typeof prev === "number" ? prev : 0) - 1));
      }

      return { previous };
    },
    onError: (_err, _itemId, ctx) => {
      if (ctx?.previous) qc.setQueryData(["favorites", type.toLowerCase()], ctx.previous);
      if (onCountChange) {
        onCountChange((prev) => (typeof prev === "number" ? prev + 1 : prev));
      }
      alert("찜 해제에 실패했어. 잠시 후 다시 시도해줘");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["favorites", type.toLowerCase()] });
    },
    onSuccess: (_res, itemId) => {
      console.log("[emit] 보내는 중:", { type, id: itemId, willFavorite: false });
      emitFavoriteChange({ type, id: itemId, willFavorite: false });

      // 해제 성공 시 로컬스토리지에서 제거
      try {
        const storageKey = `${prefix}${String(itemId)}`;
        console.log(`로컬스토리지에서 제거 시도: ${storageKey}`);

        window.localStorage.removeItem(storageKey);
        console.log(`로컬스토리지 제거 완료: ${storageKey}`);

        // 로컬 상태 즉시 업데이트
        setLocalFavoriteIds((prev) => {
          const newIds = prev.filter((id) => id !== String(itemId));
          console.log(`로컬 상태 업데이트: ${prev} → ${newIds}`);
          return newIds;
        });
      } catch (e) {
        console.error("로컬스토리지 제거 실패:", e);
      }
    },
  });

  const data = query.data?.pages?.flatMap((page) => page.content) ?? [];
  const loading = query.isLoading;
  const error = query.error;
  const hasMore = query.hasNextPage;
  const loadMore = query.fetchNextPage;
  const totalCount = query.data?.pages?.[0]?.totalElements ?? data.length;

  // 개수 변경 시 콜백 호출
  useEffect(() => {
    if (onCountChange) {
      onCountChange(typeof totalCount === "number" && totalCount >= 0 ? totalCount : data.length);
    }
  }, [totalCount, data.length, onCountChange]);

  // 로컬스토리지 동기화는 이벤트 기반으로만 처리
  // data 변경 시 자동 저장하는 로직 제거 (찜 해제 후 다시 추가되는 문제 해결)

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    unfavorite: unfavoriteMutation.mutate,
    unfavoriteLoading: unfavoriteMutation.isLoading,
    totalCount,
    localFavoriteIds, // 디버깅용
  };
}
