import styled from "styled-components";

export const KakaoMapWrapper = styled.div`
  width: 100%;
  height: ${({ $isListMode }) => ($isListMode ? "100vh" : "60vh")};
  overflow-y: ${({ $isListMode }) => ($isListMode ? "auto" : "hidden")};
  background-color: #fff;
  position: relative;

  @media screen and (min-width: 768px) {
    height: ${({ $isListMode }) => ($isListMode ? "100vh" : "500px")};
  }
`;

export const KakaoMapBox = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
  touch-action: auto;
  pointer-events: auto;
  -ms-touch-action: auto;
  -webkit-user-drag: none;
  -webkit-touch-callout: none;
`;

export const PICKLMarker = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  width: 28px;
  height: 43px;
  z-index: 5;
  pointer-events: none;
`;

export const CurrentLocationButton = styled.button`
  position: absolute;
  bottom: 40px;
  left: 16px;
  z-index: 10;
  pointer-events: auto;

  width: 46px;
  height: 46px;
  border-radius: 50%;
  background-color: #fbfbfb;
  border: 1px solid #ccc;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: bottom 0.3s ease;
`;

export const CurrentLocationIcon = styled.img`
  width: 29px;
  height: 29px;
`;

export const StoreListButton = styled.button`
  ${(props) =>
    props.$isListMode
      ? `
    position: fixed;
    bottom: 90px;
    right: 20px;
  `
      : `
    position: absolute;
    right: 16px;
    bottom: ${props.$isCardVisible ? "265px" : "40px"};
  `}

  z-index: 1000;
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 12px;
  border-radius: 30px;
  background-color: #ffffff;
  border: 1px solid #ccc;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: bottom 0.3s ease;
`;

export const StoreListIcon = styled.img`
  width: 14.4px;
  height: 10.8px;
  flex-shrink: 0;
  stroke-width: 1.8px;
  stroke: #000;
`;

export const StoreListText = styled.p`
  color: #1c1b1a;
  font-family: Pretendard;
  font-size: 12.6px;
  font-style: normal;
  font-weight: 600;
  line-height: 19.8px;
`;
