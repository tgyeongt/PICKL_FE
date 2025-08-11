import axios from "axios";

export async function searchKeywordFromKakao(query) {
  const { data } = await axios.get("https://dapi.kakao.com/v2/local/search/keyword.json", {
    params: {
      query,
      size: 10,
    },
    headers: {
      Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_API_KEY}`,
    },
  });

  return data.documents;
}
