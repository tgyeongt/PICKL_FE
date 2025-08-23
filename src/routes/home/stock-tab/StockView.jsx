import { useState, useEffect } from "react";
import styled from "styled-components";
import StockCard from "./StockCard";
import QuestionIcon from "@icon/home/question_icon.svg";
import { APIService } from "../../../shared/lib/api";

export default function StockView() {
  const [selected, setSelected] = useState("소매");
  const [item, setItem] = useState([]);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const MARKET_MAP = {
    소매: "소매",
    "중도매인 판매": "도매",
  };

  const tooltipContent =
    selected === "소매"
      ? "일반 소비자에게 판매되는 가격"
      : "도매상·중간상인에게 대량 판매 시 적용되는 가격";

  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await APIService.private.get("/daily-price-change/store/category", {
          params: {
            market: MARKET_MAP[selected],
          },
        });
        if (res.success) {
          setItem(res.data);
        }
      } catch (error) {
        console.error(error);
      }
    }
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <Wrapper>
      <Header>
        <TabGroup>
          <TabButton
            $isActive={selected === "소매"}
            onClick={() => {
              setSelected("소매");
              setTooltipOpen(false);
            }}
          >
            소매
          </TabButton>
          <TabButton
            $isActive={selected === "중도매인 판매"}
            onClick={() => {
              setSelected("중도매인 판매");
              setTooltipOpen(false);
            }}
          >
            중도매인 판매
          </TabButton>
        </TabGroup>

        <TooltipWrapper>
          <Label>{selected}</Label>
          <button onClick={() => setTooltipOpen((prev) => !prev)}>
            <img src={QuestionIcon} alt="설명 아이콘" />
          </button>
          {tooltipOpen && <TooltipText>{tooltipContent}</TooltipText>}
        </TooltipWrapper>
      </Header>

      <CardWrapper>
        {item.map((item, idx) => (
          <StockCard
            key={idx}
            title={item.categoryName}
            price={item.avgLatestPrice}
            diff={item.priceDiff}
            diffrate={item.priceDiffRate}
            market={MARKET_MAP[selected]}
            categoryCode={item.categoryCode}
            oneDayAgoPrice={item.avgOneDayAgoPrice}
          />
        ))}
      </CardWrapper>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding-bottom: 50px;
  height: 75vh;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0;
  gap: 10px;
  padding: 0 5px;
`;

const TabGroup = styled.div`
  display: flex;
  gap: 10px;
`;

const TabButton = styled.button`
  padding: 4px 15px;
  font-size: 14px;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  background-color: ${({ $isActive }) => ($isActive ? "#1C1B1A" : "#E4E4E7")};
  color: ${({ $isActive }) => ($isActive ? "#fff" : "#5A5B6A")};
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Label = styled.span`
  font-size: 13px;
  color: #5a5b6a;
  margin-right: 4px;
`;

const TooltipText = styled.div`
  position: absolute;
  top: 27px;
  right: 0;
  background-color: #fff;
  color: #5a5b6a;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: 12px;
  line-height: 1.4;
  white-space: normal;
  width: max-content;
  max-width: 250px;
  z-index: 10;
`;

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 80px;
`;
