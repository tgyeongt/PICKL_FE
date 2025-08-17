import { useInfiniteQuery } from "@tanstack/react-query";
import { APIService } from "../../../shared/lib/api";

const PAGE_SIZE = 20;

export default function useFavoriteRecipes() {
  const query = useInfiniteQuery({
    queryKey: ["favorites", "recipes"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await APIService.private.get("/favorites/recipes", {
        params: {
          page: pageParam,
          size: PAGE_SIZE,
          sort: "createdAt,desc",
        },
      });

      const data = res?.data ?? {};
      return {
        content: data.content || [],
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 1,
        page: data.number ?? pageParam,
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages - 1) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });

  const recipes = query.data?.pages.flatMap((p) => p.content) ?? [];
  const totalCount = query.data?.pages[0]?.totalElements ?? 0;

  return {
    recipes,
    totalCount,
    loading: query.isLoading || query.isFetchingNextPage,
    error: query.isError ? query.error : null,
    hasMore: query.hasNextPage,
    loadMore: query.fetchNextPage,
  };
}
