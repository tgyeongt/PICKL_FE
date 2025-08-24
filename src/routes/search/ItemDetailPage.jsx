import useHeader from "@hooks/useHeader";
import styled from "styled-components";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { APIService } from "../../shared/lib/api";
import OneDayChart from "./OneDayChart";
import OneYearChart from "./OneYearChart";
import FiveYearChart from "./FiveYearChart";

export default function ItemDetailPage() {
  const { productNo } = useParams();
  const [item, setItem] = useState(null);
  const [period, setPeriod] = useState("1D");

  useHeader({
    title: "상세 정보",
    showBack: true,
    showHeart: true,
    targetType: "INGREDIENT",
    targetId: productNo,
  });

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await APIService.private.get(`/daily-price-change/store/items/${productNo}`, {
          params: {
            productNo,
          },
        });
        setItem(res.data);
      } catch (error) {
        console.error("Failed to fetch items:", error);
      }
    }
    fetchItems();
  }, [productNo]);

  const renderChart = () => {
    switch (period) {
      case "1D":
        return <OneDayChart />;
      case "1Y":
        return <OneYearChart />;
      case "5Y":
        return <FiveYearChart />;
      default:
        return null;
    }
  };

  return (
    <Wrapper>
      {item ? (
        <>
          <TextWrapper>
            <TitleText>
              <span className="title">{item.productName}</span>
              <span className="unit">{item.unit}</span>
            </TitleText>
            <DiffText $isPositive={item.priceDiff >= 0}>
              <span className="price">{item.latestPrice?.toLocaleString() || "-"}원</span>
              {item.priceDiff >= 0 ? "+" : ""}
              {item.priceDiff}원 ({item.priceDiffRate}%)
            </DiffText>
          </TextWrapper>

          <ChartWrapper>{renderChart()}</ChartWrapper>

          <ButtonWrapper>
            <button className={period === "1D" ? "active" : ""} onClick={() => setPeriod("1D")}>
              1일
            </button>
            <button className={period === "1Y" ? "active" : ""} onClick={() => setPeriod("1Y")}>
              1년
            </button>
            <button className={period === "5Y" ? "active" : ""} onClick={() => setPeriod("5Y")}>
              5년
            </button>
          </ButtonWrapper>
        </>
      ) : (
        <p>로딩 중...</p>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 0 30px;
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TextWrapper = styled.div`
  margin-top: 70px;
  width: 100%;
`;

const TitleText = styled.p`
  .title {
    font-size: 22px;
    font-weight: 600;
    margin-top: 20px;
  }

  .unit {
    font-size: 14px;
    font-weight: 400;
    margin-left: 7px;
    color: #adadaf;
  }
`;

const DiffText = styled.p`
  font-size: 16px;
  font-weight: 400;
  color: ${({ $isPositive }) => ($isPositive ? "#e42938" : "#1677FF")};

  .price {
    font-size: 26px;
    font-weight: 700;
    margin-right: 5px;
  }
`;

const ChartWrapper = styled.div`
  margin-top: 5vh;
  height: 300px;
`;

const ButtonWrapper = styled.div`
  margin-top: 30px;
  display: flex;
  gap: 10px;

  button {
    padding: 5px 16px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
    color: #adadaf;

    &.active {
      background: #e1e1e3;
      color: #5a5b6a;
    }
  }
`;
