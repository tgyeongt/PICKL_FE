import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import currentIcon from "@icon/map/currentIcon.svg";
import currentLocationMoveIcon from "@icon/map/vector.svg";

export default function CheckLocationMap({ onAddressChange }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);

  useEffect(() => {
    const loadMap = async () => {
      if (!window.kakao || !window.kakao.maps) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${
            import.meta.env.VITE_KAKAOMAP_APP_KEY
          }&libraries=services&autoload=false`;
          script.async = true;
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      window.kakao.maps.load(() => {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const { latitude, longitude } = coords;
            const container = mapRef.current;
            const options = {
              center: new window.kakao.maps.LatLng(latitude, longitude),
              level: 3,
            };
            const newMap = new window.kakao.maps.Map(container, options);
            setMap(newMap);

            const geocoder = new window.kakao.maps.services.Geocoder();

            const updateAddress = (latlng) => {
              geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result, status) => {
                if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
                  const road = result[0].road_address?.address_name || "";
                  const jibun = result[0].address?.address_name || "";

                  if (onAddressChange) {
                    onAddressChange({
                      roadAddress: road,
                      jibunAddress: jibun,
                      lat: latlng.getLat(),
                      lng: latlng.getLng(),
                      isManual: true,
                    });
                  }
                }
              });
            };

            updateAddress(newMap.getCenter());

            window.kakao.maps.event.addListener(newMap, "idle", () => {
              const center = newMap.getCenter();
              updateAddress(center);
            });
          },
          (error) => {
            alert("위치 정보를 불러올 수 없습니다.");
            console.error(error);
          }
        );
      });
    };

    loadMap();
  }, [onAddressChange]);

  const moveToCurrentLocation = () => {
    if (!map) return;

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        const newCenter = new window.kakao.maps.LatLng(latitude, longitude);
        map.setCenter(newCenter);
      },
      (error) => {
        alert("현재 위치를 불러올 수 없습니다.");
        console.error(error);
      }
    );
  };

  return (
    <CheckLocationMapWrapper>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      <PICKLMarker src={currentIcon} />
      <CurrentLocationButton onClick={moveToCurrentLocation}>
        <CurrentLocationIcon src={currentLocationMoveIcon} alt="현재 위치 이동 아이콘" />
      </CurrentLocationButton>
    </CheckLocationMapWrapper>
  );
}

const CheckLocationMapWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const PICKLMarker = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -100%);
  width: 28px;
  height: 43px;
  z-index: 10;
  pointer-events: none;
`;

const CurrentLocationButton = styled.button`
  position: absolute;
  bottom: 16px;
  right: 16px;
  background-color: #ffffff;
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
