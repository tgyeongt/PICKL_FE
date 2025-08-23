import useHeader from "@hooks/useHeader";
import styled from "styled-components";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { APIService } from "../../../shared/lib/api";
import OneDayChart from "./OneDayChart";
import OneYearChart from "./OneYearChart";
import FiveYearChart from "./FiveYearChart";

export default function CategoryDetailPage() {
  useHeader({
    title: "상세 정보",
    showBack: true,
  });

  const { market, categoryCode } = useParams();
  const [period, setPeriod] = useState("1D");
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await APIService.private.get("/daily-price-change/store/category", {
          params: { market, categoryCode },
        });
        if (res.success) {
          setDetail(res.data[0]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchDetail();
  }, [market, categoryCode]);

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
      {detail ? (
        <>
          <TextWrapper>
            <p className="title">{detail.categoryName}</p>
            <DiffText $isPositive={detail.priceDiff >= 0}>
              <span className="price">{detail.avgLatestPrice?.toLocaleString() || "-"}원</span>
              {detail.priceDiff >= 0 ? "+" : ""}
              {detail.priceDiff}원 ({detail.priceDiffRate}%)
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
  margin-top: 50px;
  width: 100%;

  .title {
    font-size: 22px;
    font-weight: 600;
    margin-top: 20px;
  }
`;

const DiffText = styled.span`
  font-size: 16px;
  font-weight: 400;
  color: ${({ $isPositive }) => ($isPositive ? "#e42938" : "#1677FF")};

  .price {
    font-size: 26px;
    font-weight: 700;
    margin-right: 5px;
  }
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

const ChartWrapper = styled.div`
  margin-top: 30px;
  height: 300px;
`;
