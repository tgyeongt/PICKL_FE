import { useEffect, useState } from "react";
import styled from "styled-components";
import rain from "@icon/home/rain.svg";
import { APIService } from "../../shared/lib/api";
import { useNavigate } from "react-router";

export default function RecommendCard() {
  const [item, setItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await APIService.private.get(`/daily-price-change/store/items/367`);

        if (res.success && res.data) {
          const data = res.data;
          setItem({
            name: "쪽파",
            price: data.latestPrice,
            change: data.priceDiffRate,
          });
        }
      } catch (err) {
        console.error("파전 데이터 가져오기 실패:", err);
      }
    }

    fetchProduct();
  }, []);

  return (
    <Wrapper onClick={() => navigate("/search/ingredients/367")}>
      <TextDiv>
        <p className="text_12">
          비 오는 날에는 <strong>파전</strong> 어때요?
        </p>

        {item ? (
          <>
            <p className="text_20">
              지금 {item.name}은 평균{" "}
              <span className="text_20_green">{item.price.toLocaleString()}원</span>
              <span className="text_12_grey">/ 개</span>
            </p>
            <p className="text_12_blue">
              내일 {item.change > 0 ? "+" : ""}
              {item.change}% {item.change > 0 ? "상승" : "하락"} 예측!
            </p>
          </>
        ) : (
          <p className="text_12_grey">데이터 불러오는 중...</p>
        )}
      </TextDiv>
      <img src={rain} alt="" />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 17px;
  margin: 0 20px;
  border-radius: 20px;
  background-color: white;
  box-shadow: 1px 1px 10px 0 rgba(217, 217, 217, 0.4), 4px 4px 4px 0 #f5f5f5 inset;

  img {
    width: 50px;
    height: auto;
  }
`;

const TextDiv = styled.div`
  .text_12 {
    font-size: 12px;
    font-weight: 500;
  }
  .text_20 {
    font-size: 20px;
    font-weight: 700;
  }
  .text_20_green {
    font-size: 20px;
    font-weight: 700;
    color: #38b628;
  }
  .text_12_blue {
    font-size: 12px;
    font-weight: 500;
    color: #1677ff;
  }
  .text_12_grey {
    font-size: 12px;
    font-weight: 500;
    color: #adadaf;
    padding-left: 5px;
  }
`;
