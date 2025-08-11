import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { selectedAddressAtom } from "./state/addressAtom";
import styled from "styled-components";
import backIcon from "@icon/map/backButtonIcon.svg";
import clearIcon from "@icon/map/x-circle.svg";
import DropdownIcon from "@icon/map/dropdown.svg";

import * as mockModule from "../../shared/lib/mock/stores.mock";
const mockStoresData = (mockModule && (mockModule.default || mockModule.mockStoresData)) || [];

import SearchResultList from "./SearchResultList";

export default function MapSearchPage() {
  const navigate = useNavigate();
  const selectedAddress = useAtomValue(selectedAddressAtom);
  const [keyword, setKeyword] = useState("");

  const filteredStores = keyword
    ? mockStoresData.filter((store) => store.name?.includes?.(keyword))
    : [];

  return (
    <MapSearchWrapper>
      <BackButton onClick={() => navigate(-1)}>
        <BackIcon src={backIcon} alt="뒤로가기" />
      </BackButton>
      <MapSearchBox>
        <SearchBar>
          <SearchInput
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="시장 or 마트를 검색해보세요"
          />
          {keyword && (
            <ClearButton onClick={() => setKeyword("")}>
              <ClearIcon src={clearIcon} alt="지우기" />
            </ClearButton>
          )}
        </SearchBar>

        {keyword ? (
          <SearchInfoText>
            <GreenText>{keyword}</GreenText>으로 검색된 결과{" "}
            <GreenText>{filteredStores.length}</GreenText>건
          </SearchInfoText>
        ) : (
          <LocationBox onClick={() => navigate("/map/edit-location")}>
            <AddressTextWrapper>
              <AddressText>
                {selectedAddress.roadAddress || selectedAddress.jibunAddress}
              </AddressText>
              <DropdownImg src={DropdownIcon} alt="드롭다운" />
            </AddressTextWrapper>
          </LocationBox>
        )}

        <SearchResultList stores={filteredStores} />
      </MapSearchBox>
    </MapSearchWrapper>
  );
}

const MapSearchWrapper = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  width: 100%;
  overflow-y: auto;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 13px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 0;
  display: flex;
  align-items: center;
  width: 35px;
  height: 35px;
`;

const BackIcon = styled.img`
  width: 24px;
  height: 24px;
`;

const MapSearchBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
`;

const SearchBar = styled.div`
  width: 100%;
  height: 35px;
  display: flex;
  align-items: center;
  position: relative;
  padding: 5px 15px;
  border-radius: 15px;
  background: #eaeaed;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #333;
  font-size: 12px;
  font-weight: 500;
  margin-left: 11px;

  &::placeholder {
    color: #adadaf;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  position: absolute;
  right: 12px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  padding: 0;
`;

const ClearIcon = styled.img`
  width: 18px;
  height: 18px;
`;

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
  font-size: 13.5px;
  font-weight: 700;
  line-height: 20px;
`;

const DropdownImg = styled.img`
  width: 9.5px;
  height: 8px;
`;

const SearchInfoText = styled.p`
  font-size: 13.5px;
  line-height: 20px;
  font-weight: 500;
  color: #1c1b1a;
`;

const GreenText = styled.span`
  color: #58d748;
`;
