import styled from "styled-components";

export const KakaoMapWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

export const KakaoMapBox = styled.div`
  width: 100%;
  height: 100%;
`;

export const CurrentLocationButton = styled.button`
  position: absolute;
  bottom: 80px;
  left: 20px;
  z-index: 10;
  background-color: #fbfbfb;
  border: 1px solid #ccc;
  border-radius: 48px;
  width: 46px;
  height: 46px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CurrentLocationIcon = styled.img`
  width: 29.04px;
  height: 29.04px;
`;