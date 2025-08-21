import { useMemo, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import useHeader from "../../shared/hooks/useHeader";
import useFavoriteIngredients from "./hooks/useFavoriteIngredients";

import FavoriteItemCard from "./FavoriteItemCard";
import { AnimatePresence, motion } from "framer-motion";

export default function MyIngredientsPage() {
  useHeader({ title: "찜한 식재료 목록", showBack: true });

  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);

  const { ingredients, loading, error, hasMore, loadMore, unfavorite } = useFavoriteIngredients();

  const observerRef = useRef(null);

  // 로컬스토리지에서 식재료 찜 개수 계산
  const countIngredientFavoritesFromLS = () => {
    try {
      const ls = window.localStorage;
      let c = 0;
      console.log("=== 로컬스토리지 검사 ===");
      for (let i = 0; i < ls.length; i++) {
        const k = ls.key(i) || "";
        console.log(`키 ${i}: ${k}`);
        if (k.startsWith("favorite:INGREDIENT:") && ls.getItem(k) === "true") {
          c++;
          console.log(`찜한 식재료 발견: ${k}`);
        }
      }
      console.log(`총 찜한 식재료 개수: ${c}`);
      return c;
    } catch (e) {
      console.error("로컬스토리지 검사 중 오류:", e);
      return 0;
    }
  };

  // 실시간 찜 개수 업데이트
  const [localFavCount, setLocalFavCount] = useState(() => countIngredientFavoritesFromLS());

  useEffect(() => {
    const sync = () => setLocalFavCount(countIngredientFavoritesFromLS());
    sync();
    window.addEventListener("storage", sync);
    // 같은 탭 반영: 간단히 setTimeout 폴링 0ms도 가능하지만, 필요 없으면 생략해도 OK
    window.addEventListener("favorite:change", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("favorite:change", sync);
    };
  }, []);

  // 디버깅을 위한 로그
  console.log("=== MyIngredientsPage 디버깅 ===");
  console.log("ingredients:", ingredients);
  console.log("loading:", loading);
  console.log("error:", error);
  console.log("localFavCount:", localFavCount);
  console.log("ingredients length:", ingredients?.length);
  console.log("ingredients type:", typeof ingredients);
  console.log("ingredients is array:", Array.isArray(ingredients));

  const handleCardClick = async (item) => {
    if (isNavigating) return; // 이미 네비게이션 중이면 중복 클릭 방지

    try {
      setIsNavigating(true);
      const ingredientId = String(item.id);
      console.log("클릭된 식재료 ID:", ingredientId);

      // 식재료 상세 페이지로 이동
      console.log("식재료 상세 페이지로 이동:", `/search/ingredients/${ingredientId}`);
      navigate(`/search/ingredients/${ingredientId}`);
    } catch (error) {
      console.error("Failed to navigate to ingredient:", error);
      alert("식재료로 이동하는 중 오류가 발생했습니다.");
    } finally {
      setIsNavigating(false);
    }
  };

  const items = useMemo(
    () =>
      (ingredients || []).map((ingredient) => ({
        id: ingredient.ingredientId,
        name: ingredient.name,
        img: ingredient.thumbnailUrl,
      })),
    [ingredients]
  );

  console.log("items:", items);
  console.log("items length:", items?.length);

  // 오로지 로컬스토리지만 사용
  const displayTotal = localFavCount;

  useEffect(() => {
    if (!hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { threshold: 1.0 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
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
        <ErrorContainer>
          <ErrorText>데이터를 불러오는데 실패했어</ErrorText>
          <ErrorDetail>서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</ErrorDetail>
          <RetryButton onClick={() => window.location.reload()}>다시 시도</RetryButton>
        </ErrorContainer>
      </MyIngredientsPageWrapper>
    );
  }

  return (
    <MyIngredientsPageWrapper>
      <CountRow>
        <SubText>
          총 <GreenText>{displayTotal}개</GreenText>
        </SubText>
      </CountRow>

      {isNavigating && (
        <LoadingIndicator>
          <LoadingText>식재료로 이동 중...</LoadingText>
        </LoadingIndicator>
      )}

      <Grid as={motion.div} layout>
        <AnimatePresence>
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 12 }}
              transition={{ duration: 0.25 }}
              ref={idx === items.length - 1 ? observerRef : null}
            >
              <FavoriteItemCard
                img={item.img}
                title={item.name}
                liked={true}
                onClick={() => handleCardClick(item)}
                onClickHeart={(e) => {
                  e?.stopPropagation?.();
                  unfavorite(item.id);
                }}
                disabled={isNavigating}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </Grid>

      {loading && <LoadingText>추가 로딩 중...</LoadingText>}
    </MyIngredientsPageWrapper>
  );
}

const MyIngredientsPageWrapper = styled.div`
  min-height: 100vh;
  background: #fbfbfb;
  padding-bottom: 90px;
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
  font-size: 14px;
`;

const ErrorText = styled.div`
  text-align: center;
  padding: 50px 20px;
  color: #ff4444;
  font-size: 16px;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 50px 20px;
`;

const ErrorDetail = styled.p`
  color: #666;
  font-size: 14px;
  margin-top: 10px;
`;

const RetryButton = styled.button`
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #38b628;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;

  &:hover {
    background-color: #2f9a20;
  }
`;

const LoadingIndicator = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;
