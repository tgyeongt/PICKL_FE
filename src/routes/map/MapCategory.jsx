import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import CategoryList from "./CategoryList";
import DropdownIcon from "@icon/map/dropdown.svg";
import { useAtomValue } from "jotai";
import { selectedAddressAtom } from "./state/addressAtom";

export default function MapCategory() {
  const navigate = useNavigate();
  const selectedAddress = useAtomValue(selectedAddressAtom);

  return (
    <MapCategoryWrapper>
      <LocationBox onClick={() => navigate("/map/edit-location")}>
        <AddressTextWrapper>
          <AddressText>{selectedAddress.roadAddress || selectedAddress.jibunAddress}</AddressText>
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
