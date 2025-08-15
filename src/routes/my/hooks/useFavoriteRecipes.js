import { useState, useEffect } from "react";

const useFavoriteRecipes = (page = 0, size = 20) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchFavoriteRecipes = async (pageNum = 0) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://api.picklocal.site/api/favorites/recipes?page=${pageNum}&size=${size}&sort=createdAt,desc`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("API Response for recipes:", data); // 응답 구조 확인용 로그

      if (pageNum === 0) {
        setRecipes(data.content || data);
        // 총 개수 설정
        setTotalCount(data.totalElements || (Array.isArray(data) ? data.length : 0));
      } else {
        setRecipes((prev) => [...prev, ...(data.content || data)]);
      }

      // 페이지네이션 정보가 있는 경우
      if (data.content && data.totalPages) {
        setHasMore(pageNum < data.totalPages - 1);
      } else {
        // 단순 배열인 경우
        setHasMore((data.content || data).length === size);
      }
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch favorite recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchFavoriteRecipes(page + 1);
    }
  };

  useEffect(() => {
    fetchFavoriteRecipes(0);
  }, []);

  return {
    recipes,
    loading,
    error,
    hasMore,
    totalCount,
    refetch: () => fetchFavoriteRecipes(0),
    loadMore,
  };
};

export default useFavoriteRecipes;
