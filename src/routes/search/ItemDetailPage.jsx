import useHeader from "@hooks/useHeader";
import styled from "styled-components";

export default function ItemDetailPage() {
  useHeader({
    title: "상세 정보",
    showBack: true,
    showHeart: true,
  });

  return (
    <Wrapper>
      <p className="title">식재료이름</p>
      <span className="price">21,108.31</span>
      <span className="rate">+50.36(0.2%)</span>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 0 10px;

  .title {
    font-size: 22px;
    font-weight: 600;
    margin-top: 20px;
  }
  .price {
    font-size: 26px;
    font-weight: 700;
    color: #e42938;
  }
  .rate {
    font-size: 16px;
    font-weight: 400;
    color: #e42938;
    margin-left: 5px;
  }
`;
