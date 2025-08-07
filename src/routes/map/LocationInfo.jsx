import styled from "styled-components";

export default function LocationInfo({ roadAddress, jibunAddress }) {
  return (
    <LocationInfoWrapper>
      <InfoTextSection>
        <MainText>{roadAddress || "도로명 주소"}</MainText>
        <SubText>
          {roadAddress}
          {jibunAddress && `(${jibunAddress})`}
        </SubText>
      </InfoTextSection>
      <BarSection>
        <AlertBar>지도의 표시와 실제 위치가 맞는지 확인해 주세요.</AlertBar>
        <LocationSetButton>현 위치로 설정</LocationSetButton>
      </BarSection>
    </LocationInfoWrapper>
  );
}

const LocationInfoWrapper = styled.div`
  padding-left: 20px;
  padding-right: 20px;
`;

const InfoTextSection = styled.div``;

const MainText = styled.p``;

const SubText = styled.p``;

const BarSection = styled.div``;

const AlertBar = styled.div``;

const LocationSetButton = styled.button``;
