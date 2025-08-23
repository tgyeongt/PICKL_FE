import styled from "styled-components";

export default function MyTopBar() {
  return (
    <MyTopBarWrapper>
      <TopText>마이페이지</TopText>
    </MyTopBarWrapper>
  );
}

const MyTopBarWrapper = styled.div`
  max-width: 390px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  position: fixed;
  align-items: center;
  justify-content: center;
  background-color: #fbfbfb;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  text-align: center;
  z-index: 100;
  padding: 0 20px;
`;

const TopText = styled.p`
  color: #1c1b1a;
  text-align: center;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
`;
