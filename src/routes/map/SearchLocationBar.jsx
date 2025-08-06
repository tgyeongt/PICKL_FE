import styled from "styled-components";
import { useState } from "react";
import SearchImg from "@icon/map/searchButton.png";
import ClearImg from "@icon/map/x-circle.svg";

export default function SearchLocationBar() {
  const [keyword, setKeyword] = useState("");

  const handleClear = () => {
    setKeyword("");
  };

  return (
    <SearchLocationWrapper>
      <SearchIcon src={SearchImg} alt="돋보기" />
      <SearchInput
        type="text"
        placeholder="지번, 도로명, 건물명으로 검색"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      {keyword && (
        <ClearButton onClick={handleClear}>
          <ClearIcon src={ClearImg} alt="닫기" />
        </ClearButton>
      )}
    </SearchLocationWrapper>
  );
}

const SearchLocationWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 44px;
  padding: 16px;
  background-color: #eaeaed;
  border-radius: 10px;
  position: relative;
`;

const SearchIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 8px;
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #333;
  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
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
