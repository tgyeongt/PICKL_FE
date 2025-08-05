import styled from "styled-components";
import MapHeader from "./MapHeader";
import MapCategory from "./MapCategory";

export default function Map() {
  return (
    <MapWrapper>
      <MapHeader />
      <MapCategory />
      {/* <KakaoMap /> */}
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
