import styled from "styled-components";
import { useNavigate } from "react-router-dom";

export default function StockCard({ title, price, rate }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/category/${title}`);
  };

  const isPositive = rate > 0;

  return (
    <Card onClick={handleClick}>
      <TextBox isPositive={isPositive}>
        <p className="title">{title}</p>
        <span className="price">{price.toLocaleString()}</span>
        <span className="rate">
          {rate > 0 ? "+" : ""}
          {rate}
        </span>
      </TextBox>
      <p>그래프자리</p>
    </Card>
  );
}

const Card = styled.div`
  background-color: #fff;
  width: 100%;
  height: auto;
  display: flex;
  border-radius: 10px;
`;

const TextBox = styled.div`
  padding: 25px 15px;

  .title {
    font-size: 20px;
    font-weight: 600;
  }

  .price {
    font-size: 24px;
    font-weight: 700;
    color: ${({ isPositive }) => (isPositive ? "#e42938" : "#1677FF")};
  }

  .rate {
    font-size: 14px;
    font-weight: 400;
    color: ${({ isPositive }) => (isPositive ? "#e42938" : "#1677FF")};
    margin-left: 5px;
  }
`;
