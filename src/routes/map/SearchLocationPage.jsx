import { useNavigate } from "react-router-dom";
import { useState } from "react";
import styled from "styled-components";
import backIcon from "@icon/map/backButtonIcon.svg";
import clearIcon from "@icon/map/x-circle.svg";

export default function SearchLocationPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  return (
    <SearchLocationWrapper>
      <BackButton onClick={() => navigate(-1)}>
        <BackIcon src={backIcon} alt="뒤로가기" />
      </BackButton>
      <SearchLocationBar>
        <SearchInput
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="지번, 도로명, 건물명을 검색해보세요"
        />
        {keyword && (
          <ClearButton>
            <ClearIcon src={clearIcon} alt="지우기" onClick={() => setKeyword("")} />
          </ClearButton>
        )}
      </SearchLocationBar>
    </SearchLocationWrapper>
  );
}

const SearchLocationWrapper = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  width: 100%;
  overflow-y: auto;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 13px;
  padding-bottom: 0;
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

const SearchLocationBar = styled.div`
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
  font-family: Pretendard;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
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
