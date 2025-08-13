import { useParams } from "react-router-dom";
import { useState } from "react";
import styled from "styled-components";
import seasonalList from "./seasonalList";
import DetailItem from "./DetailItem";
import useHeader from "@hooks/useHeader";

import Icon1 from "@icon/home/recipe_icon_1.svg";
import Icon3 from "@icon/home/detail_icon_3.svg";
import Icon4 from "@icon/home/detail_icon_4.svg";
import Timer from "@icon/home/time_icon.svg";
import Knife from "@icon/home/knife_icon.svg";

export default function SeasonalRecipePage() {
  const { id, recipeId } = useParams();
  const item = seasonalList.find((el) => el.id === Number(id));
  const recipe = item?.recipes.find((r) => r.id === Number(recipeId));

  useHeader({
    title: "레시피",
    showBack: true,
    showHeart: true,
    onHeartOn: HeartOn,
    onHeartOff: HeartOff,
  });

  function HeartOn() {
    alert("찜하기 추가 완료");
  }

  function HeartOff() {
    alert("찜하기 삭제 완료");
  }

  const [openStates, setOpenStates] = useState([false, false, false]);
  const toggleSection = (index) => {
    setOpenStates((prev) => prev.map((isOpen, i) => (i === index ? !isOpen : isOpen)));
  };

  const icons = [Icon1, Icon3, Icon4];

  return (
    <Wrapper>
      <Title>{recipe.title}</Title>
      <AboutBox>
        <AboutLineDiv>
          <img src={Timer} />
          <span className="title">조리시간</span>
          <span className="time">약 7~8분</span>
        </AboutLineDiv>
        <AboutLineDiv>
          <img src={Knife} />
          <span className="title">추천 분류</span>
          <div className="category">간식</div>
          <div className="category">아침</div>
        </AboutLineDiv>
      </AboutBox>

      <DetailWrapper>
        {recipe.questions.map((detail, i) => (
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
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px;
  background-color: #f6f6f6;
  height: 100vh;
`;

const Title = styled.p`
  font-size: 24px;
  font-weight: 700;
  margin-top: 20px;
`;

const AboutBox = styled.div`
  display: flex;
  flex-direction: column;
  padding: 15px 20px;
  background-color: #eaeaed;
  border-radius: 15px;
  gap: 10px;
  margin: 20px 0;
`;

const AboutLineDiv = styled.div`
  display: flex;
  flex-direction: row;
  gap: 5px;
  font-size: 14px;

  .title {
    font-weight: 600;
    margin-right: 30px;
    margin-left: 5px;
  }

  .time {
    color: #787885;
    font-weight: 500;
  }

  .category {
    font-size: 12px;
    background-color: #787885;
    color: #fff;
    padding: 2px 12px;
    border-radius: 10px;
  }
`;

const DetailWrapper = styled.div`
  width: 100%;
  margin-top: 15px;
`;
