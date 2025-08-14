import styled from "styled-components";

export default function RecommendCard() {
  return (
    <Wrapper>
      <TextDiv>
        <p className="text_12">
          비 오는 날에는 <strong>감자전</strong> 어때요?
        </p>
        <p className="text_20">
          지금 감자는 평균 <span className="text_20_green">1,800원</span>
          <span className="text_12_grey">/ kg</span>
        </p>
        <p className="text_12_blue">내일 +2% 상승 예측!</p>
      </TextDiv>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 20px;
  margin: 0 20px;
  border-radius: 20px;
  background-color: white;
  box-shadow: 1px 1px 10px 0 rgba(217, 217, 217, 0.4), 4px 4px 4px 0 #f5f5f5 inset;
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
