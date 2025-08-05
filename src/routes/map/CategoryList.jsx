import styled from "styled-components";
import { useState } from "react";
import selectAll from "@icon/selectAll.png";
import selectMarket from "@icon/selectMarket.png";
import selectMart from "@icon/selectMart.png";

export default function CategoryList() {
  const [selected, setSelected] = useState("all");

  return (
    <CategoryListWrapper>
      <CategoryItem onClick={() => setSelected("all")}>
        <CategoryButton $selected={selected === "all"}>
          <CategoryIcon src={selectAll} alt="전체" />
        </CategoryButton>
        <CategoryLabel $selected={selected === "all"}>전체</CategoryLabel>
      </CategoryItem>

      <CategoryItem onClick={() => setSelected("market")}>
        <CategoryButton $selected={selected === "market"}>
          <CategoryIcon src={selectMarket} alt="재래시장" />
        </CategoryButton>
        <CategoryLabel $selected={selected === "market"}>재래시장</CategoryLabel>
      </CategoryItem>

      <CategoryItem onClick={() => setSelected("mart")}>
        <CategoryButton $selected={selected === "mart"}>
          <CategoryIcon src={selectMart} alt="대형마트" />
        </CategoryButton>
        <CategoryLabel $selected={selected === "mart"}>대형마트</CategoryLabel>
      </CategoryItem>
    </CategoryListWrapper>
  );
}

const CategoryListWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 20px;
`;

const CategoryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  cursor: pointer;
`;

const CategoryButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  width: 50px;
  height: 50px;
  background-color: ${({ $selected }) => ($selected ? "#E6F8EB" : "#fff")};
  border: ${({ $selected }) => ($selected ? "1.5px solid #58D748" : "1px solid #ddd")};
  border-radius: 10px;
  box-shadow: 1px 1px 4px 0 var(--GREY10, #e1e1e3);
  cursor: pointer;
`;

const CategoryIcon = styled.img`
  width: 40px;
  height: 40px;
`;

const CategoryLabel = styled.p`
  color: #000;
  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: ${({ $selected }) => ($selected ? 700 : 400)};
  line-height: 20px;
`;
