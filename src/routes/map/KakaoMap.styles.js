import styled from "styled-components";

export const KakaoMapWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 435px;
  overflow: hidden;
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
