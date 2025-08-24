import styled from "styled-components";

export const StoreCardWrapper = styled.div`
  ${(props) =>
    props.$isListMode
      ? `
    position: static;
    transform: none;
    opacity: 1;
    pointer-events: auto;
    margin: 12px 0;
    width: 100%;
    padding: 0;
    box-sizing: border-box;
  `
      : `
    position: absolute;
    bottom: 15px;
    left: 50%;
    transform: translateX(-50%) translateY(30px);
    opacity: 0;
    pointer-events: none;
    &.show {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
      pointer-events: auto;
    }

    width: calc(100% - 35px); // 기존처럼 좁은 카드
    max-width: 768px;
  `}

  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 200;
  transition: opacity 0.4s ease, transform 0.4s ease;
`;

export const ImageWrapper = styled.div`
  position: relative;
`;

export const StoreImage = styled.img`
  width: 100%;
  height: 132.03px;
  object-fit: cover;
`;

export const TypeIcon = styled.img`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
`;

export const BottomBox = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const StoreName = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: #1c1b1a;
`;

export const StoreAddress = styled.p`
  font-size: 13px;
  color: #757575;
`;

export const DetailInfoBox = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 4px;
`;

export const InfoBox = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const DistanceIcon = styled.img`
  width: 16px;
  height: 16px;
`;

export const InfoText = styled.p`
  font-size: 13px;
  color: #58d748;
`;

export const ByText = styled.p`
  font-size: 13px;
  color: #757575;
`;
