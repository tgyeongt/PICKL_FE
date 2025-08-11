import styled from "styled-components";
import MyTopBar from "./MyTopBar";
import HelloSection from "./HelloSection";
import StateSection from "./StateSection";
import MyActivitiesSection from "./MyActivitiesSection";
import MyServiceSection from "./MyServiceSection";

export default function My() {
  return (
    <MyWrapper>
      <MyTopBar />
      <HelloSection />
      <StateSection />
      <MyActivitiesSection />
      <GreyBox></GreyBox>
      <MyServiceSection />
    </MyWrapper>
  );
}

const MyWrapper = styled.div``;

const GreyBox = styled.div`
  width: 100%;
  height: 9px;
  flex-shrink: 0;
  background: #f4f4f4;
`;
