import { useMemo, useEffect, useRef } from "react";
import styled from "styled-components";
import useHeader from "../../shared/hooks/useHeader";
import useFavoriteIngredients from "./hooks/useFavoriteIngredients";

import watermelonImg from "@icon/home/watermelon.png";
import FavoriteItemCard from "./FavoriteItemCard";

export default function MyIngredientsPage() {
  useHeader({
    title: "찜한 식재료 목록",
    showBack: true,
  });

  const { ingredients, loading, error, hasMore, loadMore, totalCount } = useFavoriteIngredients();
  const observerRef = useRef(null);

  const items = useMemo(
    () =>
      (ingredients || []).map((ingredient) => ({
        id: ingredient.ingredientId,
        name: ingredient.name,
        description: ingredient.shortDesc || "맛있는 식재료입니다",
        img: ingredient.thumbnailUrl || watermelonImg,
      })),
    [ingredients]
  );

  // IntersectionObserver로 마지막 아이템 감지
  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [hasMore, loading, loadMore]);

  if (loading && items.length === 0) {
    return (
      <MyIngredientsPageWrapper>
        <LoadingText>로딩 중...</LoadingText>
      </MyIngredientsPageWrapper>
    );
  }

  if (error) {
    return (
      <MyIngredientsPageWrapper>
        <ErrorText>데이터를 불러오는데 실패했습니다.</ErrorText>
      </MyIngredientsPageWrapper>
    );
  }

  return (
    <MyIngredientsPageWrapper>
      <CountRow>
        <SubText>
          총 <GreenText>{totalCount}개</GreenText>
        </SubText>
      </CountRow>

      <Grid>
        {items.map((item, idx) => (
          <FavoriteItemCard
            key={item.id}
            img={item.img}
            title={item.name}
            description={item.description}
            onClick={() => {}}
            // 마지막 카드에 ref 연결
            ref={idx === items.length - 1 ? observerRef : null}
          />
        ))}
      </Grid>

      {loading && <LoadingText>추가 로딩 중...</LoadingText>}
    </MyIngredientsPageWrapper>
  );
}

const MyIngredientsPageWrapper = styled.div`
  min-height: 100vh;
  background: #fbfbfb;
  padding-bottom: 90px; /* 하단 네비게이션 여백 */
`;

const CountRow = styled.div`
  max-width: 390px;
  margin: 6px auto 10px;
  padding: 0 20px;
  box-sizing: border-box;
`;

const SubText = styled.p`
  color: #adadaf;
  font-size: 12px;
`;

const GreenText = styled.span`
  color: #38b628;
  font-size: 12px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding: 0 20px 20px;
  max-width: 390px;
  margin: 0 auto;
`;

const LoadingText = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const ErrorText = styled.div`
  text-align: center;
  padding: 50px 20px;
  color: #ff4444;
`;
