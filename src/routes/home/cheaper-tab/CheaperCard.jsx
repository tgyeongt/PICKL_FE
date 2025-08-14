import styled from "styled-components";
import grapeIcon from "@icon/home/grape_icon.svg";
import superMarketIcon from "@icon/home/super_market.svg";
import traditionalMarketIcon from "@icon/home/traditional_market.svg";
import lineIcon from "@icon/home/line.svg";

export default function CheaperCard({ selected, name, unit, marketPrice, superMarketPrice }) {
  const mainIcon = selected === "전통시장" ? traditionalMarketIcon : superMarketIcon;
  const mainCategory = selected;

  return (
    <CardWrapper>
      <NameWrapper>
        <img src={grapeIcon} alt="상품 이미지" />
        <p className="name">{name}</p>
        <span className="weight">/ {unit}</span>
      </NameWrapper>

      <PriceWrapper>
        <img src={mainIcon} alt={mainCategory} />

        <AccentBox selected={selected}>
          <p className="category">{mainCategory}</p>
          <p className="price">{selected === "전통시장" ? marketPrice : superMarketPrice}원</p>
        </AccentBox>

        <Line src={lineIcon} alt="구분선" />

        <NormalBox>
          <p className="category">{selected === "전통시장" ? "대형마트" : "전통시장"}</p>
          <p className="price">{selected === "전통시장" ? superMarketPrice : marketPrice}원</p>
        </NormalBox>
      </PriceWrapper>
    </CardWrapper>
  );
}

const CardWrapper = styled.div`
  background-color: #ffffff;
  padding: 15px;
  border-radius: 11px;
  margin-bottom: 15px;
`;

const NameWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  .name {
    font-size: 15px;
    font-weight: 700;
    margin-left: 12px;
  }
  .weight {
    font-size: 12px;
    font-weight: 400;
    color: #787885;
    margin-top: 4px;
    margin-left: 4px;
  }
`;

const PriceWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 12px;
  align-items: center;
  justify-content: space-between;
  position: relative;
`;

const Line = styled.img`
  position: absolute;
  top: 50%;
  left: 69%;
  transform: translate(-50%, -50%);
`;

const AccentBox = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 20px 0 14px;

  .category {
    color: #1c1b1a;
    font-weight: 600;
    font-size: 24px;
    line-height: normal;
  }

  .price {
    color: ${({ selected }) => (selected === "전통시장" ? "#EC5F5F" : "#5F89EC")};
    font-weight: 700;
    font-size: 30px;
  }
`;

const NormalBox = styled.div`
  display: flex;
  flex-direction: column;
  color: #adadaf;
  margin-left: auto;
  margin-right: 10px;

  .category {
    font-weight: 400;
    font-size: 17px;
    line-height: normal;
  }

  .price {
    font-weight: 700;
    font-size: 17px;
    line-height: normal;
    margin-top: 5px;
  }

  .line {
    margin: 0 20px;
  }
`;
