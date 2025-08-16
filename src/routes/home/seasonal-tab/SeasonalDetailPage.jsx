import { useState, useEffect } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { APIService } from "../../../shared/lib/api";
import Icon1 from "@icon/home/detail_icon_1.svg";
import Icon2 from "@icon/home/detail_icon_2.svg";
import Icon3 from "@icon/home/detail_icon_3.svg";
import Icon4 from "@icon/home/detail_icon_4.svg";
import useHeader from "@hooks/useHeader";
import DetailItem from "./DetailItem";

export default function SeasonalDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const navigate = useNavigate();

  useHeader({
    title: "상세 정보",
    showBack: true,
  });

  useEffect(() => {
    async function fetchSeasonItems() {
      try {
        const res = await APIService.private.get(`/season-items/${id}`);
        setItem(res.data);
        const resRecipes = await APIService.private.get(`/season-items/${id}/recipes`);
        setRecipes(resRecipes.data);
      } catch (error) {
        console.error("Failed to fetch season items:", error);
      }
    }
    fetchSeasonItems();
  }, [id]);

  const [openStates, setOpenStates] = useState([false, false, false, false]);
  const toggleSection = (index) => {
    setOpenStates((prev) => prev.map((isOpen, i) => (i === index ? !isOpen : isOpen)));
  };

  const icons = [Icon1, Icon2, Icon3, Icon4];

  if (!item) return <p>Loading...</p>;

  const questions = [
    { q: "선택 방법", a: item.howToChoose },
    { q: "보관 방법", a: item.howToStore },
    { q: "손질 방법", a: item.howToTrim },
    { q: "팁", a: item.tip },
  ];

  return (
    <Wrapper>
      <MainCard>
        <Image src={item.imageUrl} alt={item.itemname} />
        <TextBox>
          <TitleRow>
            <div className="left">
              <p className="title">{item.itemname}</p>
              <span className="calorie">{item.calorie}</span>
            </div>
            <div className="label">{item.representativeNutrient}</div>
          </TitleRow>
          <p className="desc">{item.shortDescription}</p>
        </TextBox>
      </MainCard>

      <DetailWrapper>
        {questions.map((detail, i) => (
          <DetailItem
            key={i}
            icon={icons[i]}
            title={detail.q}
            content={detail.a}
            isOpen={openStates[i]}
            onToggle={() => toggleSection(i)}
          />
        ))}
      </DetailWrapper>

      <RecipeWrapper>
        <span className="text_500">건강을 챙기는</span>
        <span className="text_700">{item.itemname}</span>
        <span className="text_500">요리 추천</span>
        <RecipeCardWrapper>
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id}>
              <p className="title">{recipe.recipeName}</p>
              <div className="btn" onClick={() => navigate(`/seasonal/${item.id}/${recipe.id}`)}>
                레시피 보기
              </div>
            </RecipeCard>
          ))}
        </RecipeCardWrapper>
      </RecipeWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  height: 92vh;
  background-color: #f5f5f7;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  padding-bottom: 80px;
`;

const MainCard = styled.div`
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  overflow: hidden;
  width: 100%;
  max-width: 400px;
`;

const Image = styled.img`
  width: 100%;
  height: 140px;
  object-fit: cover;
`;

const TextBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;

  .desc {
    font-size: 14px;
    color: #787885;
    margin-top: 5px;
  }
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .left {
    display: flex;
    align-items: baseline;
    gap: 10px;
  }
  .title {
    font-size: 24px;
    font-weight: 700;
  }
  .calorie {
    font-size: 12px;
    color: #787885;
  }
  .label {
    background-color: #27801c;
    color: #fff;
    border-radius: 20px;
    padding: 4px 14px;
    font-size: 12px;
    font-weight: 600;
  }
`;

const DetailWrapper = styled.div`
  width: 100%;
  margin-top: 15px;
`;

const RecipeWrapper = styled.div`
  width: 100%;
  margin-top: 15px;
  font-size: 18px;

  .text_500 {
    font-weight: 500;
  }

  .text_700 {
    font-weight: 700;
    margin: 0 3px;
  }
`;

const RecipeCardWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 20px;
  width: 100%;
  margin-top: 15px;
`;

const RecipeCard = styled.div`
  padding: 20px 10px 10px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #fff;
  border-radius: 15px;
  min-width: 160px;

  .title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .btn {
    padding: 5px 35px;
    color: #fff;
    background-color: #292a31;
    font-size: 13px;
    border-radius: 8px;
    cursor: pointer;
  }
`;
