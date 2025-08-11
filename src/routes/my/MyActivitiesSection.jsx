import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { APIService } from "../../shared/lib/api";

import tomatoIcon from "@icon/my/tomatoIcon.svg";
import recipeIcon from "@icon/my/saladIcon.svg";
import historyIcon from "@icon/my/fileIcon.svg";
import chevronRight from "@icon/my/chevron-right.svg";

export default function MyActivitiesSection() {
  const navigate = useNavigate();

  // 백엔드 연결 시 변경해야 할 부분
  const { data } = useQuery({
    queryKey: ["me", "activities", "counts"],
    queryFn: async () => {
      // 예시: GET /me/activities
      // 응답 예: { ingredients: 20, recipes: 10, history: 10 }
      const res = await APIService.private.get("/me/activities");
      const raw = res?.data ?? res ?? {};
      return {
        ingredients: Number.isFinite(raw.ingredients) ? raw.ingredients : 20,
        recipes: Number.isFinite(raw.recipes) ? raw.recipes : 10,
        history: Number.isFinite(raw.history) ? raw.history : 10,
      };
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  const counts = {
    ingredients: data?.ingredients ?? 20,
    recipes: data?.recipes ?? 10,
    history: data?.history ?? 10,
  };

  return (
    <MyActivitiesSectionWrapper>
      <SectionTitle>내 활동</SectionTitle>

      <List>
        <ListButton onClick={() => navigate("/my/list-ingredients")}>
          <Left>
            <Icon src={tomatoIcon} alt="" />
            <LabelBox>
              <MainLabel>찜한 식재료 목록</MainLabel>
              <SubCount>{counts.ingredients}개</SubCount>
            </LabelBox>
          </Left>
          <RightIcon src={chevronRight} alt="" />
        </ListButton>

        <ListButton onClick={() => navigate("/my/list-recipes")}>
          <Left>
            <Icon src={recipeIcon} alt="" />
            <LabelBox>
              <MainLabel>찜한 레시피 목록</MainLabel>
              <SubCount>{counts.recipes}개</SubCount>
            </LabelBox>
          </Left>
          <RightIcon src={chevronRight} alt="" />
        </ListButton>

        <ListButton onClick={() => navigate("/my/history")}>
          <Left>
            <Icon src={historyIcon} alt="" />
            <LabelBox>
              <MainLabel>피클 히스토리</MainLabel>
              <SubCount>{counts.history}개</SubCount>
            </LabelBox>
          </Left>
          <RightIcon src={chevronRight} alt="" />
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
  padding: 0 16px 20.5px 16px;
`;

const SectionTitle = styled.h2`
  color: #0f1c0d;
  font-family: Pretendard;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  margin-bottom: 25px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ListButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 10px 8px;
  background: #fbfbfb;
  border: none;
  border-radius: 12px;
  cursor: pointer;

  transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.18s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: scale(0.99);
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
  aspect-ratio: 1/1;
  object-fit: contain;
`;

const LabelBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const MainLabel = styled.p`
  color: #0f1c0d;
  font-feature-settings: "dlig" on;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
`;

const SubCount = styled.span`
  color: #45a639;
  font-feature-settings: "dlig" on;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 21px; /* 150% */
`;

const RightIcon = styled.img`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
`;
