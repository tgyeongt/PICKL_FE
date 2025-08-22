import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import HomeChart from "./HomeChart";

export default function StockCard({
  title,
  price,
  diff,
  diffrate,
  market,
  categoryCode,
  oneDayAgoPrice,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/category/${title}`);
    navigate(`/category/${market}/${categoryCode}`);
  };

  const $isPositive = diff > 0;

  return (
    <Card onClick={handleClick}>
      <TextBox $isPositive={$isPositive}>
        <p className="title">{title}</p>
        <span className="price">{price.toLocaleString()}</span>
        <span className="diff">
          {diff > 0 ? "+" : ""}
          {diff}원 ({diffrate})
        </span>
      </TextBox>
      <HomeChart price={price} oneDayAgoPrice={oneDayAgoPrice} />
    </Card>
  );
}

const Card = styled.div`
  background-color: #fff;
  width: 100%;
  height: auto;
  display: flex;
  border-radius: 10px;
  padding: 10px 10px;
  align-items: center;
  justify-content: space-between;
`;

const TextBox = styled.div`
  padding-left: 5px;
  .title {
    font-size: 20px;
    font-weight: 600;
  }

  .price {
    font-size: 24px;
    font-weight: 700;
    color: ${({ $isPositive }) => ($isPositive ? "#e42938" : "#1677FF")};
  }

  .diff {
    font-size: 14px;
    font-weight: 400;
    color: ${({ $isPositive }) => ($isPositive ? "#e42938" : "#1677FF")};
    margin-left: 5px;
  }
`;
