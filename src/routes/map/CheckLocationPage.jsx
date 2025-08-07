import { useSetAtom } from "jotai";
import styled from "styled-components";
import TopBar from "./TopBar";
import LocationInfo from "./LocationInfo";
import CheckLocationMap from "./CheckLocationMap";
import { selectedAddressAtom } from "../map/state/addressAtom";

export default function CheckLocationPage() {
  const setAddress = useSetAtom(selectedAddressAtom);

  return (
    <CheckLocationWrapper>
      <TopBar title="지도에서 위치 확인" />
      <KakaoMapBox>
        <CheckLocationMap onAddressChange={setAddress} />
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
  height: 435px;
  position: relative;
  margin-top: 10px;
`;
