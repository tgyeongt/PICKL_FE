import styled from "styled-components";
import MapHeader from "./MapHeader";
import MapCategory from "./MapCategory";
import KakaoMap from "./KakaoMap";
import { useAtomValue } from "jotai";
import { selectedAddressAtom } from "./state/addressAtom";

export default function Map() {
  const selectedAddress = useAtomValue(selectedAddressAtom);

  return (
    <MapWrapper>
      <MapHeader />
      <MapCategory />
      <MapContent>
        <KakaoMap key={`${selectedAddress.lat}-${selectedAddress.lng}`} />
      </MapContent>
    </MapWrapper>
  );
}

const MapWrapper = styled.div`
  width: 100%;
  max-width: 390px;
  min-height: 100vh;
  background-color: #fbfbfb;
  overflow-y: auto;
  display: block;
`;

const MapContent = styled.div`
  margin-top: 16px;
  height: auto;
  padding-bottom: 60px;
`;
