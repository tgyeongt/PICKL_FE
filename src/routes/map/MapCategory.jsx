import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import CategoryList from "./CategoryList";
import DropdownIcon from "@icon/map/dropdown.svg";
import useCurrentAddress from "../map/hooks/useCurrentAddress";

export default function MapCategory() {
  const navigate = useNavigate();
  const { address, isLoading } = useCurrentAddress();

  return (
    <MapCategoryWrapper>
      <LocationBox onClick={() => navigate("/map/edit-location")}>
        {isLoading ? (
          <AddressText>위치 불러오는 중</AddressText>
        ) : (
          <AddressTextWrapper>
            <AddressText>{address}</AddressText>
            <DropdownImg src={DropdownIcon} alt="드롭다운" />
          </AddressTextWrapper>
        )}
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
  gap: 6px;
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
