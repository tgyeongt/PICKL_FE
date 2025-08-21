import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import CategoryList from "./CategoryList";
import DropdownIcon from "@icon/map/dropdown.svg";
import { useAtomValue } from "jotai";
import { selectedAddressAtom } from "./state/addressAtom";

// 기본 위치 상수 (KakaoMap.jsx와 동일)
const DEFAULT_LOCATION = {
  lat: 37.5013, // 서울 서초구 강남대로 27 (강남역 근처)
  lng: 127.0254,
  name: "서울 서초구 강남대로 27",
};

export default function MapCategory() {
  const navigate = useNavigate();
  const selectedAddress = useAtomValue(selectedAddressAtom);

  // 주소가 없으면 기본 위치 사용
  const displayAddress =
    selectedAddress.roadAddress || selectedAddress.jibunAddress || DEFAULT_LOCATION.name;

  return (
    <MapCategoryWrapper>
      <LocationBox onClick={() => navigate("/map/edit-location")}>
        <AddressTextWrapper>
          <AddressText>{displayAddress}</AddressText>
          <DropdownImg src={DropdownIcon} alt="드롭다운" />
        </AddressTextWrapper>
      </LocationBox>
      <CategoryList />
    </MapCategoryWrapper>
  );
}

const MapCategoryWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 151px;
  padding-left: 16px;
  padding-top: 16px;
`;

const LocationBox = styled.div`
  margin-bottom: 29px;
  cursor: pointer;
`;

const AddressTextWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 3px;
`;

const AddressText = styled.span`
  color: #000;
  font-family: Pretendard;
  font-size: 13.5px;
  font-style: normal;
  font-weight: 700;
  line-height: 20px;
`;

const DropdownImg = styled.img`
  width: 9.5px;
  height: 8px;
`;
