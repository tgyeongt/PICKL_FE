import styled from "styled-components";
import { useEffect, useRef, useState } from "react";
import CurrentLocationImg from "@icon/vector.png";

export default function KakaoMap() {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);

  const loadScript = () => {
    if (document.querySelector("script[src*='dapi.kakao.com']")) return Promise.resolve();

    return new Promise((resolve) => {
      const script = document.createElement("script");
      const appKey = import.meta.env.VITE_KAKAOMAP_APP_KEY;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
      script.async = true;
      script.onload = resolve;
      document.head.appendChild(script);
    });
  };

  const createMap = () => {
    window.kakao.maps.load(() => {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        const container = mapRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(latitude, longitude),
          level: 3,
        };
        const map = new window.kakao.maps.Map(container, options);
        setMapInstance(map);
      });
    });
  };

  useEffect(() => {
    loadScript().then(createMap);
  }, []);

  const handleMoveToCurrentLocation = () => {
    if (!mapInstance) return;

    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const { latitude, longitude } = coords;
      const moveLatLng = new window.kakao.maps.LatLng(latitude, longitude);
      mapInstance.panTo(moveLatLng);
    });
  };

  return (
    <KakaoMapWrapper>
      <KakaoMapBox ref={mapRef} />
      <CurrentLocationButton onClick={handleMoveToCurrentLocation}>
        <CurrentLocationIcon src={CurrentLocationImg} alt="현재 위치" />
      </CurrentLocationButton>
    </KakaoMapWrapper>
  );
}

const KakaoMapWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const KakaoMapBox = styled.div`
  width: 100%;
  height: 100%;
`;

const CurrentLocationButton = styled.button`
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

const CurrentLocationIcon = styled.img`
  width: 29.04px;
  height: 29.04px;
`;
