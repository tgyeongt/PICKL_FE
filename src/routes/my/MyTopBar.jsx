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
  align-items: center;
  justify-content: center;
  background-color: #fbfbfb;
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding-top: calc(env(safe-area-inset-top, 0px) + 14px);
  padding-bottom: 43px;
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
