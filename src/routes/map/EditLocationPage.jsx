import styled from "styled-components";
import TopBar from "./TopBar";
import EditLocationContent from "./EditLocationContent";

export default function EditLocationPage() {
  return (
    <EditLocationWrapper>
      <TopBar title="위치설정" />
      <TitleBox>
        <Title>현재위치를</Title>
        <Title>설정해주세요</Title>
      </TitleBox>
      <EditLocationContent />
    </EditLocationWrapper>
  );
}

const EditLocationWrapper = styled.div`
  width: 100%;
  max-width: 768px;
  height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  padding-left: 20px;
`;

const TitleBox = styled.div``;

const Title = styled.p``;
