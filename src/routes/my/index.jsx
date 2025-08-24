import styled from "styled-components";
import MyTopBar from "./MyTopBar";
import HelloSection from "./HelloSection";
import StateSection from "./StateSection";
import MyActivitiesSection from "./MyActivitiesSection";
import MyServiceSection from "./MyServiceSection";
import { ConvertPointsProvider } from "./convert/ConvertPointsContext";

export default function My() {
  return (
    <MyWrapper>
      <MyTopBar />
      <HelloSection />
      <ConvertPointsProvider>
        <StateSection />
      </ConvertPointsProvider>
      <MyActivitiesSection />
      <GreyBox></GreyBox>
      <MyServiceSection />
    </MyWrapper>
  );
}

const MyWrapper = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 100vh;
  padding: 0 20px;
`;

const GreyBox = styled.div`
  width: 100%;
  height: 9px;
  flex-shrink: 0;
  background: #f4f4f4;
`;
