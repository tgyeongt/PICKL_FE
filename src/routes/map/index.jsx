import styled from "styled-components";
import MapHeader from "./MapHeader";

export default function Map() {
  return (
    <MapWrapper>
      <MapHeader />
      {/* <MapCategory /> */}
      {/* <KakaoMap /> */}
    </MapWrapper>
  );
}

const MapWrapper = styled.div`
  width: 100%;
  max-width: 768px;
  height: 100vh;
  background-color: #f6f6f6;
  display: flex;
  flex-direction: column;
`;
