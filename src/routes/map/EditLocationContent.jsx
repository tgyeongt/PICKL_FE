import styled from "styled-components";
import SearchLocationBar from "./SearchLocationBar";
import CurrentLocationBar from "./CurrentLocationBar";

export default function EditLocationContent() {
  return (
    <EditContentWrapper>
      <SearchLocationBar />
      <CurrentLocationBar />
    </EditContentWrapper>
  );
}

const EditContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;
