import { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import Icon1 from "@icon/home/detail_icon_1.svg";
import Icon2 from "@icon/home/detail_icon_2.svg";
import Icon3 from "@icon/home/detail_icon_3.svg";
import Icon4 from "@icon/home/detail_icon_4.svg";

import seasonalList from "./seasonalList";
import useHeader from "@hooks/useHeader";
import DetailItem from "./DetailItem";

export default function SeasonalDetailPage() {
  const { id } = useParams();
  const item = seasonalList.find((el) => el.id === Number(id));

  useHeader({
    title: "상세 정보",
    showBack: true,
  });

  const [openStates, setOpenStates] = useState([false, false, false, false]);
  const toggleSection = (index) => {
    setOpenStates((prev) => prev.map((isOpen, i) => (i === index ? !isOpen : isOpen)));
  };

  const icons = [Icon1, Icon2, Icon3, Icon4];

  return (
    <Wrapper>
      <MainCard>
        <Image src={item.img} alt={item.title} />
        <TextBox>
          <TitleRow>
            <div className="left">
              <p className="title">{item.title}</p>
              <span className="calorie">100g / 86kcal</span>
            </div>
            <div className="label">탄수화물</div>
          </TitleRow>
          <p className="desc">{item.description}</p>
        </TextBox>
      </MainCard>

      <DetailWrapper>
        {item.questions.map((detail, i) => (
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

/* 스타일 */
const Wrapper = styled.div`
  min-height: 100vh;
  background-color: #f5f5f7;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
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
  max-width: 400px;
  margin-top: 15px;
`;
