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
  background-color: #fbfbfb;
  display: flex;
  flex-direction: column;
  padding-left: 20px;
`;

const TitleBox = styled.div`
  height: 64px;
  padding: 0;
  margin-bottom: 18px;
`;

const Title = styled.p`
  color: #1C1B1A;
  font-family: Pretendard;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: 32px;
`;
