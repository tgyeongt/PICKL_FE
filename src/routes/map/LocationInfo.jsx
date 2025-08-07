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
        <AlertBar>
          <AlertText>지도의 표시와 실제 위치가 맞는지 확인해 주세요.</AlertText>
        </AlertBar>
        <LocationSetButton>현 위치로 설정</LocationSetButton>
      </BarSection>
    </LocationInfoWrapper>
  );
}

const LocationInfoWrapper = styled.div`
  padding-left: 20px;
  padding-right: 20px;
  height: 320px;
`;

const InfoTextSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 18px;
  padding: 0;
  gap: 3.5px;
`;

const MainText = styled.p`
  color: #1c1b1a;
  font-family: Pretendard;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: 28px;
`;

const SubText = styled.p`
  color: #787885;
  font-family: Pretendard;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: 22px;
`;

const BarSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  align-items: center;
  justify-content: center;
  gap: 17px;
`;

const AlertBar = styled.div`
  width: 100%;
  height: auto;
  min-height: 40px;
  border-radius: 10px;
  background: #ffeeef;
  padding: 8px 12px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const AlertText = styled.p`
  color: #e42938;
  text-align: center;
  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px;
  word-break: keep-all;
`;

const LocationSetButton = styled.button`
  width: 100%;
  padding: 11px 100px;
  height: 50px;
  border-radius: 10px;
  background: #000;
  color: #ffffff;
  text-align: center;
  font-family: Pretendard;
  font-size: 17px;
  font-style: normal;
  font-weight: 600;
  line-height: 24px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: #222;
    transform: scale(1.015);
  }

  &:active {
    background: #111;
    transform: scale(0.98);
  }
`;
