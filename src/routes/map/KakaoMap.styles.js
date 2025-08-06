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
  left: 16px;
  z-index: 10;

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
