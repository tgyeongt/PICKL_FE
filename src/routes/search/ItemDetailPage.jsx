import useHeader from "@hooks/useHeader";
import styled from "styled-components";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { APIService } from "../../shared/lib/api";

export default function ItemDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useHeader({
    title: "상세 정보",
    showBack: true,
    showHeart: true,
    targetType: "INGREDIENT",
    targetId: id,
  });

  useEffect(() => {
    async function fetchSeasonItems() {
      try {
        const res = await APIService.private.get(`/daily-price-change/store/items/${id}`);
        setItem(res.data);
      } catch (error) {
        console.error("Failed to fetch season items:", error);
      }
    }
    fetchSeasonItems();
  }, [id]);

  return (
    <Wrapper>
      <TextBox>
        <p className="gap">
          <span className="title">{item?.productName}</span>
          <span className="unit">{item?.unit}</span>
        </p>
        <p className="gap">
          <span className="price">{Number(item?.latestPrice).toLocaleString()}원</span>
          <span className="rate">{item?.priceDiff}원</span>
          <span className="rate">({item?.priceDiffRate}%)</span>
        </p>
      </TextBox>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 10px;
`;

const TextBox = styled.div`
  padding: 20px 0;

  .gap {
    margin-bottom: 10px;
  }
  .title {
    font-size: 22px;
    font-weight: 600;
    margin-top: 20px;
  }
  .unit {
    font-size: 12px;
    color: #adadaf;
    font-weight: 400;
    margin-left: 4px;
  }
  .price {
    font-size: 26px;
    font-weight: 700;
    color: #e42938;
    margin-right: 5px;
  }
  .rate {
    font-size: 16px;
    font-weight: 400;
    color: #e42938;
  }
`;
