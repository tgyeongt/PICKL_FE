import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import useMySummary from "./hooks/useMySummary";

import tomatoIcon from "@icon/my/tomatoIcon.svg";
import recipeIcon from "@icon/my/saladIcon.svg";
import historyIcon from "@icon/my/fileIcon.svg";
import chevronRight from "@icon/my/chevron-right.svg";

export default function MyActivitiesSection() {
  const navigate = useNavigate();
  const { data: summary } = useMySummary();
  const counts = {
    ingredients: summary?.favoriteIngredientCount ?? 0,
    recipes: summary?.favoriteRecipeCount ?? 0,
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
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
  margin-bottom: 25px;
  padding: 0 8px;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-x: hidden;
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
  overflow: hidden;

  transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.18s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: translateY(0);
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
  line-height: 21px;
`;

const RightIcon = styled.img`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
`;
