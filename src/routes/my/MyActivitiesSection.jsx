import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import useMySummary from "./hooks/useMySummary";
import { useAtom } from "jotai";
import { favoriteRecipesCountAtom } from "./state/favoriteRecipesCountAtom";
import { useEffect } from "react";

import tomatoIcon from "@icon/my/tomatoIcon.svg";
import recipeIcon from "@icon/my/saladIcon.svg";
import historyIcon from "@icon/my/fileIcon.svg";
import chevronRight from "@icon/my/chevron-right.svg";

// ---- 보조 유틸 (이 파일 안에만) ----
const FAV_RECIPE_PREFIX = "favorite:RECIPE:";
const FAV_INGREDIENT_PREFIX = "favorite:INGREDIENT:";

function countRecipeFavoritesFromLS() {
  try {
    const ls = window.localStorage;
    let cnt = 0;
    for (let i = 0; i < ls.length; i++) {
      const k = ls.key(i) || "";
      if (k.startsWith(FAV_RECIPE_PREFIX) && ls.getItem(k) === "true") cnt++;
    }
    return cnt;
  } catch {
    return 0;
  }
}

function countIngredientFavoritesFromLS() {
  try {
    const ls = window.localStorage;
    let cnt = 0;
    for (let i = 0; i < ls.length; i++) {
      const k = ls.key(i) || "";
      if (k.startsWith(FAV_INGREDIENT_PREFIX) && ls.getItem(k) === "true") cnt++;
    }
    return cnt;
  } catch {
    return 0;
  }
}
function patchLocalStorageForFavorites(onChange) {
  const ls = window.localStorage;
  if (window.__favPatchApplied) return () => {};
  window.__favPatchApplied = true;
  const origSet = ls.setItem.bind(ls);
  const origRemove = ls.removeItem.bind(ls);
  const origClear = ls.clear.bind(ls);
  ls.setItem = (k, v) => {
    origSet(k, v);
    if (String(k).startsWith(FAV_RECIPE_PREFIX) || String(k).startsWith(FAV_INGREDIENT_PREFIX))
      onChange();
  };
  ls.removeItem = (k) => {
    origRemove(k);
    if (String(k).startsWith(FAV_RECIPE_PREFIX) || String(k).startsWith(FAV_INGREDIENT_PREFIX))
      onChange();
  };
  ls.clear = () => {
    origClear();
    onChange();
  };
  return () => {
    ls.setItem = origSet;
    ls.removeItem = origRemove;
    ls.clear = origClear;
    window.__favPatchApplied = false;
  };
}
// -----------------------------------

export default function MyActivitiesSection() {
  const navigate = useNavigate();
  const { data: summary, refetch } = useMySummary();
  const [favCount, setFavCount] = useAtom(favoriteRecipesCountAtom);

  // 로컬스토리지 기반 즉시 동기화
  useEffect(() => {
    const sync = () => setFavCount(countRecipeFavoritesFromLS());
    sync(); // 초기 1회
    const unpatch = patchLocalStorageForFavorites(sync); // 같은 탭
    window.addEventListener("storage", sync); // 다른 탭

    // 대화 삭제 이벤트 감지
    const handleConversationDeleted = () => {
      // 히스토리 개수 즉시 업데이트
      refetch();
    };

    window.addEventListener("conversationDeleted", handleConversationDeleted);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("conversationDeleted", handleConversationDeleted);
      unpatch?.();
    };
  }, [setFavCount, summary]);

  const counts = {
    ingredients: countIngredientFavoritesFromLS(),
    //  리스트 페이지가 갱신해둔 전역값을 우선 사용, 없으면 요약값
    recipes: (typeof favCount === "number" ? favCount : summary?.favoriteRecipeCount) ?? 0,
    history: summary?.pickleHistoryCount ?? 0,
  };

  return (
    <MyActivitiesSectionWrapper>
      <SectionTitle>내 활동</SectionTitle>
      <List>
        <ListButton onClick={() => navigate("/my/list-ingredients")}>
          <Card>
            <Left>
              <Icon src={tomatoIcon} alt="" />
              <LabelBox>
                <MainLabel>찜한 식재료 목록</MainLabel>
                <SubCount>{counts.ingredients}개</SubCount>
              </LabelBox>
            </Left>
            <RightIcon src={chevronRight} alt="" />
          </Card>
        </ListButton>

        <ListButton onClick={() => navigate("/my/list-recipes")}>
          <Card>
            <Left>
              <Icon src={recipeIcon} alt="" />
              <LabelBox>
                <MainLabel>찜한 레시피 목록</MainLabel>
                <SubCount>{counts.recipes}개</SubCount>
              </LabelBox>
            </Left>
            <RightIcon src={chevronRight} alt="" />
          </Card>
        </ListButton>

        <ListButton onClick={() => navigate("/my/history")}>
          <Card>
            <Left>
              <Icon src={historyIcon} alt="" />
              <LabelBox>
                <MainLabel>피클 히스토리</MainLabel>
                <SubCount>{counts.history}개</SubCount>
              </LabelBox>
            </Left>
            <RightIcon src={chevronRight} alt="" />
          </Card>
        </ListButton>
      </List>
    </MyActivitiesSectionWrapper>
  );
}

const MyActivitiesSectionWrapper = styled.section`
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  background: #fbfbfb;
  padding-bottom: 20.5px;
`;

const SectionTitle = styled.h2`
  color: #0f1c0d;
  font-family: Pretendard;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 25px;
  padding: 0 8px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 8px;
`;

const ListButton = styled.button`
  width: 100%;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
`;

const Card = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 8px;
  background: #fbfbfb;
  border-radius: 12px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  }
`;

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const Icon = styled.img`
  width: 40px;
  height: 40px;
`;

const LabelBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const MainLabel = styled.p`
  color: #0f1c0d;
  font-family: Pretendard;
  font-size: 16px;
  font-weight: 600;
`;

const SubCount = styled.span`
  color: #45a639;
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 500;
`;

const RightIcon = styled.img`
  width: 24px;
  height: 24px;
`;
