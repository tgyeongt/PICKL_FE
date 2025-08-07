import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { selectedAddressAtom } from "./state/addressAtom";
import styled from "styled-components";
import backIcon from "@icon/map/backButtonIcon.svg";
import clearIcon from "@icon/map/x-circle.svg";
import DropdownIcon from "@icon/map/dropdown.svg";

export default function MapSearchPage() {
  const navigate = useNavigate();
  const selectedAddress = useAtomValue(selectedAddressAtom);
  const [keyword, setKeyword] = useState("");

  return (
    <MapSearchWrapper>
      <SearchBar>
        <BackButton onClick={() => navigate(-1)}>
          <BackIcon src={backIcon} alt="뒤로가기" />
        </BackButton>
        <SearchInput
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="시장 또는 마트를 검색해보세요"
        />
        <ClearButton>
          <ClearIcon src={clearIcon} alt="지우기" onClick={() => setKeyword("")} />
        </ClearButton>
      </SearchBar>
      <LocationBox onClick={() => navigate("/map/edit-location")}>
        <AddressTextWrapper>
          <AddressText>{selectedAddress.roadAddress || selectedAddress.jibunAddress}</AddressText>
          <DropdownImg src={DropdownIcon} alt="드롭다운" />
        </AddressTextWrapper>
      </LocationBox>
      <LocationBox></LocationBox>
    </MapSearchWrapper>
  );
}

const MapSearchWrapper = styled.div``;

const SearchBar = styled.div``;

const BackButton = styled.button``;

const BackIcon = styled.img``;

const SearchInput = styled.input``;

const ClearButton = styled.button``;

const ClearIcon = styled.img``;

const LocationBox = styled.div`
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
