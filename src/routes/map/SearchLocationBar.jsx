import styled from "styled-components";
import { useNavigate } from "react-router";
import SearchImg from "@icon/map/searchButton.svg";

export default function SearchLocationBar() {
  const navigate = useNavigate();

  return (
    <SearchLocationWrapper>
      <SearchIcon src={SearchImg} alt="돋보기" />
      <SearchInputButton onClick={() => navigate("/map/search-location")}>
        지번, 도로명, 건물명으로 검색
      </SearchInputButton>
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

const SearchInputButton = styled.button`
  flex: 1;
  border: none;
  outline: none;
  text-align: start;
  background: transparent;
  color: #999;
  font-family: Pretendard;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease;

  &:hover {
    color: #333;
    border-radius: 8px;
  }
`;
