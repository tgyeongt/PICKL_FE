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
      <MyServiceSection />
    </MyWrapper>
  );
}

const MyWrapper = styled.div``;
