import styled from "styled-components";

export const DailyPointsResultWrapper = styled.div`
  min-height: 100dvh;
  width: 100%;
  padding: 0 0 40px;
  background: linear-gradient(180deg, #58d848 -6.04%, #fff 73.3%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
`;

export const BoxBase = styled.div`
  max-width: 390px;
  width: 100%;
  text-align: center;
  padding: 28px 12px 12px;
  margin: 0 auto;
`;

export const SuccessBox = styled(BoxBase)``;
export const FailBox = styled(BoxBase)``;

export const SmallTag = styled.div`
  display: inline-block;
  padding: 4px 16px;
  border-radius: 20px;
  border-radius: 20px;
  background: #58d848;
  margin-bottom: 18px;
  color: #fff;
  text-align: center;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px;
  margin-top: 70px;
`;

export const SuccessBigTitle = styled.p`
  color: #fff;
  text-align: center;
  font-family: Pretendard;
  font-size: 38px;
  font-style: normal;
  font-weight: 800;
  line-height: 46px;
  margin-bottom: 14.3px;
`;

export const Title = styled.h3`
  font-size: 22px;
  font-weight: 700;
  color: #1c1b1a;
`;

export const Sub = styled.p`
  color: #fff;
  text-align: center;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 26.132px;
  letter-spacing: -0.4px;
  margin-bottom: 26.7px;
`;

export const FailTitleBox = styled.div`
  margin-top: 100px;
  margin-bottom: 65px;
`;

export const FailTitle = styled.p`
  color: #fff;
  text-align: center;
  font-family: Pretendard;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 40px;
`;

export const SuccessImage = styled.img`
  width: 143px;
  height: 152.992px;
  transform: rotate(3.335deg);
  flex-shrink: 0;
  margin: 8px auto 141.95px;
  z-index: 1;
`;

export const ImgBox = styled.div`
  position: relative;
  display: inline-block;
`;

export const FailImage = styled.img`
  width: 148px;
  height: 148px;
  flex-shrink: 0;
  aspect-ratio: 1/1;
  margin: 8px auto 115px;
`;

export const DecoIcon = styled.img`
  position: absolute;
  width: ${({ $variant }) => ($variant === "success" ? "52px" : "15.18px")};
  height: ${({ $variant }) => ($variant === "success" ? "52px" : "15.26px")};
  pointer-events: none;
  z-index: 0;
`;

export const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 0 10px;
`;

export const GhostBtn = styled.button`
  height: 56px;
  border-radius: 12px;
  border: none;
  background: #f0f0f1;
  cursor: pointer;

  color: #1a1a1a;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
`;

export const PrimaryBtn = styled.button`
  height: 56px;
  border-radius: 16px;
  border: none;
  background: #1a1a1a;
  color: #fff;
  cursor: pointer;

  color: #fff;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: 24px;
`;

export const CloseBtn = styled.button`
  margin-top: 23px;
  margin-bottom: 40px;
  border: none;
  background: transparent;
  cursor: pointer;

  color: #adadaf;
  font-family: Pretendard;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
`;
