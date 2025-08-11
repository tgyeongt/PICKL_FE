import styled from "styled-components";
import useHeader from "../../shared/hooks/useHeader";
// import { useNavigate } from "react-router-dom";

import tomatoIcon from "@icon/my/tomatoIcon.svg";
import HappyFace from "@icon/my/happyFace.svg";
import SadFace from "@icon/my/sadIcon.svg";

export default function DailyPointsPage() {
  // const navigate = useNavigate();

  useHeader({
    title: "",
    showBack: true,
  });

  const handleSelect = (answer /* 'up' | 'down' */) => {
    // navigate("result", { state: { answer } });
    console.log("selected:", answer);
  };

  return (
    <DailyPointsPageWrapper>
      <IconDiv>
        <TomatoIcon src={tomatoIcon} alt="tomato" />
      </IconDiv>
      <QuestionBox>
        <QTextStrong>오늘 토마토의 가격은</QTextStrong>
        <QTextStrong>어제에 비해 올라갔을까요?</QTextStrong>
      </QuestionBox>
      <OptionBox>
        <OptionCard $variant="up">
          <EmojiIcon src={HappyFace} alt="up" />
          <OptionLabel $variant="up">올랐다</OptionLabel>
          <SelectBtn type="button" $variant="up" onClick={() => handleSelect("up")}>
            <SelectTxt>선택</SelectTxt>
          </SelectBtn>
        </OptionCard>
        <OptionCard $variant="down">
          <EmojiIcon src={SadFace} alt="down" />
          <OptionLabel $variant="down">떨어졌다</OptionLabel>
          <SelectBtn type="button" $variant="down" onClick={() => handleSelect("down")}>
            <SelectTxt>선택</SelectTxt>
          </SelectBtn>
        </OptionCard>
      </OptionBox>
      <BottomTextBox>
        <BottomText>
          정답시 <Point>100P</Point> 적립
        </BottomText>
      </BottomTextBox>
    </DailyPointsPageWrapper>
  );
}

const DailyPointsPageWrapper = styled.div`
  padding-top: calc(env(safe-area-inset-top, 0px) + 6px);
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  background: #fbfbfb;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconDiv = styled.div`
  padding-top: 63px;
`;

const TomatoIcon = styled.img`
  width: 147px;
  height: 147px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
`;

const QuestionBox = styled.div`
  margin-top: 19px;
  text-align: center;
`;

const QTextStrong = styled.p`
  color: #1c1b1a;
  text-align: center;
  font-family: Pretendard;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 40px;
`;

const OptionBox = styled.div`
  display: flex;
  gap: 13px;
  margin-top: 57px;
  padding: 0;
  width: 100%;
  justify-content: center;
`;

const OptionCard = styled.div`
  width: 170px;
  height: 210px;
  border-radius: 30px;
  border: 2px solid
    ${({ $variant }) =>
      $variant === "up" ? "rgba(228, 41, 56, 0.20)" : "rgba(22, 119, 255, 0.20)"};
  background: ${({ $variant }) => ($variant === "up" ? "#FEE" : "#E8F3FF")};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const EmojiIcon = styled.img`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
  margin-top: 42px;
  margin-bottom: 7px;
`;

const OptionLabel = styled.p`
  font-family: Pretendard;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 32px;
  color: ${({ $variant }) => ($variant === "up" ? "#E42938" : "#1677FF")};
`;

const SelectBtn = styled.button`
  display: flex;
  width: 45px;
  height: 25px;
  padding: 5px 10px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  border-radius: 30px;
  background: ${({ $variant }) => ($variant === "up" ? "#E42938" : "#1677FF")};
  cursor: pointer;
  margin-top: 27px;
  margin-bottom: 30px;

  &:hover {
    background: ${({ $variant }) => ($variant === "up" ? "#c72a37" : "#226bd2")};
  }
`;

const SelectTxt = styled.p`
  color: #fff;
  text-align: center;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px;
`;

const BottomTextBox = styled.div`
  margin-top: 36px;
  padding-bottom: 100px;
`;

const BottomText = styled.p`
  color: #2e2e2e;
  text-align: center;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
`;

const Point = styled.span`
  color: #58d848;
`;
