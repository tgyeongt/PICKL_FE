import { useState } from "react";
import styled from "styled-components";
import TopBar from "./TopBar";
import LocationInfo from "./LocationInfo";
import CheckLocationMap from "./CheckLocationMap";
import CurrentLocationImg from "@icon/map/vector.svg";

export default function CheckLocationPage() {
  const [mapInstance, setMapInstance] = useState(null);

  return (
    <CheckLocationWrapper>
      <TopBar title="지도에서 위치 확인" />
      <KakaoMapContainer>
        <MapBox>
          <CheckLocationMap setMapInstance={setMapInstance} />
          <CurrentLocationButton
            onClick={() => {
              if (!mapInstance) return;
              navigator.geolocation.getCurrentPosition(({ coords }) => {
                const moveLatLng = new window.kakao.maps.LatLng(coords.latitude, coords.longitude);
                mapInstance.panTo(moveLatLng);
              });
            }}
          >
            <CurrentLocationIcon src={CurrentLocationImg} alt="현재 위치" />
          </CurrentLocationButton>
        </MapBox>
      </KakaoMapContainer>
      <LocationInfo />
    </CheckLocationWrapper>
  );
}

const CheckLocationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const KakaoMapContainer = styled.div`
  width: 100%;
  height: 435px;
  position: relative;
  margin-top: 10px;
`;

const MapBox = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const CurrentLocationButton = styled.button`
  position: absolute;
  bottom: 16px;
  right: 16px;
  background-color: white;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.25);
  border: none;
  cursor: pointer;
  z-index: 10;
`;

const CurrentLocationIcon = styled.img`
  width: 26.04px;
  height: 26.04px;
`;
