import styled from "styled-components";
import StockCard from "./StockCard";

export default function WholesalePrice() {
  const data = [
    { title: "식량작물", price: 11108.31, rate: 50.36 },
    { title: "채소류", price: 19108.31, rate: 20.5 },
    { title: "특용작물", price: 5338.64, rate: -23.12 },
    { title: "과일류", price: 4338.64, rate: -5.5 },
  ];

  return (
    <Wrapper>
      {data.map((item, idx) => (
        <StockCard key={idx} title={item.title} price={item.price} rate={item.rate} />
      ))}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;
