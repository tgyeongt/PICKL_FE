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
  max-width: 768px;
  min-height: 100vh;
  background-color: #fbfbfb;
  display: flex;
  flex-direction: column;
`;

const MapContent = styled.div`
  flex: 1;
  margin-top: 16px;
`;
