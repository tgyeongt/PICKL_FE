import { useState } from "react";
import styled from "styled-components";
import TopBar from "./TopBar";
import LocationInfo from "./LocationInfo";
import CheckLocationMap from "./CheckLocationMap";

export default function CheckLocationPage() {
  const [selectedAddress, setSelectedAddress] = useState({
    roadAddress: "",
    jibunAddress: "",
  });

  return (
    <CheckLocationWrapper>
      <TopBar title="지도에서 위치 확인" />
      <KakaoMapBox>
        <CheckLocationMap onAddressChange={setSelectedAddress} />
      </KakaoMapBox>
      <LocationInfo
        roadAddress={selectedAddress.roadAddress}
        jibunAddress={selectedAddress.jibunAddress}
      />
    </CheckLocationWrapper>
  );
}

const CheckLocationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const KakaoMapBox = styled.div`
  width: 100%;
  height: 435px;
  position: relative;
  margin-top: 10px;
`;
