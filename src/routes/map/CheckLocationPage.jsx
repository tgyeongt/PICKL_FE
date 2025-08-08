import { useSetAtom } from "jotai";
import styled from "styled-components";
import TopBar from "./TopBar";
import LocationInfo from "./LocationInfo";
import CheckLocationMap from "./CheckLocationMap";
import { selectedAddressAtom } from "../map/state/addressAtom";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function CheckLocationPage() {
  const setAddress = useSetAtom(selectedAddressAtom);
  const location = useLocation();

  useEffect(() => {
    const { state } = location;
    if (state?.lat && state?.lng) {
      setAddress({
        lat: state.lat,
        lng: state.lng,
        roadAddress: state.roadAddress || "",
        jibunAddress: state.jibunAddress || "",
        isManual: true,
      });
    }
  }, [location, setAddress]);

  return (
    <CheckLocationWrapper>
      <TopBar title="지도에서 위치 확인" />
      <KakaoMapBox>
        <CheckLocationMap
          onAddressChange={setAddress}
          initialCenter={
            location.state?.lat && location.state?.lng
              ? { lat: location.state.lat, lng: location.state.lng }
              : undefined
          }
        />
      </KakaoMapBox>
      <LocationInfo />
    </CheckLocationWrapper>
  );
}

const CheckLocationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-y: auto;
`;

const KakaoMapBox = styled.div`
  width: 100%;
  height: 60vh;
  position: relative;
  margin-top: 10px;
`;
