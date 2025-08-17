// import { useState, useEffect } from "react";

// const useFavoriteCounts = () => {
//   const [counts, setCounts] = useState({
//     ingredients: 0,
//     recipes: 0,
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchCounts = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // 식재료 찜 개수 가져오기
//       const ingredientsResponse = await fetch(
//         "https://api.picklocal.site/api/favorites/ingredients?page=0&size=1",
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//           },
//         }
//       );

//       // 레시피 찜 개수 가져오기
//       const recipesResponse = await fetch(
//         "https://api.picklocal.site/api/favorites/recipes?page=0&size=1",
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//           },
//         }
//       );

//       if (!ingredientsResponse.ok || !recipesResponse.ok) {
//         throw new Error("Failed to fetch favorite counts");
//       }

//       const ingredientsData = await ingredientsResponse.json();
//       const recipesData = await recipesResponse.json();

//       // 페이지네이션 정보에서 총 개수 추출
//       const ingredientsCount =
//         ingredientsData.totalElements ||
//         (Array.isArray(ingredientsData) ? ingredientsData.length : 0);
//       const recipesCount =
//         recipesData.totalElements || (Array.isArray(recipesData) ? recipesData.length : 0);

//       setCounts({
//         ingredients: ingredientsCount,
//         recipes: recipesCount,
//       });
//     } catch (err) {
//       setError(err.message);
//       console.error("Failed to fetch favorite counts:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchCounts();
//   }, []);

//   return {
//     counts,
//     loading,
//     error,
//     refetch: fetchCounts,
//   };
// };

// export default useFavoriteCounts;
