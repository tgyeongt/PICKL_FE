import styled from "styled-components";
import MapHeader from "./MapHeader";
import MapCategory from "./MapCategory";
import KakaoMap from "./KakaoMap";

export default function Map() {
  return (
    <MapWrapper>
      <MapHeader />
      <MapCategory />
      <MapContent>
        <KakaoMap />
      </MapContent>
    </MapWrapper>
  );
}

const MapWrapper = styled.div`
  width: 100%;
  max-width: 768px;
  height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
`;

const MapContent = styled.div`
  flex: 1;
`;
