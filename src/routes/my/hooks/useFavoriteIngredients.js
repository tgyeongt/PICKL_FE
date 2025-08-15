import { useState, useEffect } from "react";

const useFavoriteIngredients = (page = 0, size = 20) => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchFavoriteIngredients = async (pageNum = 0) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `https://api.picklocal.site/api/favorites/ingredients?page=${pageNum}&size=${size}&sort=createdAt,desc`,
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

      console.log("API Response for ingredients:", data); // 응답 구조 확인용 로그

      if (pageNum === 0) {
        setIngredients(data.content || data);
        // 총 개수 설정
        setTotalCount(data.totalElements || (Array.isArray(data) ? data.length : 0));
      } else {
        setIngredients((prev) => [...prev, ...(data.content || data)]);
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
      console.error("Failed to fetch favorite ingredients:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchFavoriteIngredients(page + 1);
    }
  };

  useEffect(() => {
    fetchFavoriteIngredients(0);
  }, []);

  return {
    ingredients,
    loading,
    error,
    hasMore,
    totalCount,
    refetch: () => fetchFavoriteIngredients(0),
    loadMore,
  };
};

export default useFavoriteIngredients;
