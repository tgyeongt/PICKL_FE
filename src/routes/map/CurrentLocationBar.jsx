import styled from "styled-components";
import targetImg from "@icon/target.png";
// import { useNavigate } from "react-router-dom";

export default function CurrentLocationBar() {
  //   const navigate = useNavigate();
  const handleClick = () => {};

  return (
    <CurrentLocationWrapper onClick={handleClick}>
      <TargetIcon src={targetImg} alt="타겟조준이미지" />
      <TargetTextBox>
        <TargetText>현재 위치로 찾기</TargetText>
      </TargetTextBox>
    </CurrentLocationWrapper>
  );
}

const CurrentLocationWrapper = styled.button`
  width: 100%;
  height: 42px;
  border: 1px solid #c8c8c8;
  background-color: #f6f6f6;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  &:active {
    opacity: 0.8;
  }
`;

const TargetIcon = styled.img`
  width: 20px;
  height: 20px;
`;

const TargetTextBox = styled.div`
  width: 79px;
  height: 20px;
`;

const TargetText = styled.p`
  color: black;
  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
`;
