import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import SearchIconImg from "@icon/searchButton.png";

export default function MapHeader() {
  const navigate = useNavigate();

  return (
    <MapHeaderWrapper>
      <Title>Pick동네</Title>
      <SearchButton onClick={() => navigate("/search-map")}>
        <SearchIcon src={SearchIconImg} alt="검색 이미지" />
      </SearchButton>
    </MapHeaderWrapper>
  );
}

const MapHeaderWrapper = styled.div`
  position: relative;
  height: 55px;
  width: 100%;
  background: #ffffff;

  border: none;
  outline: none;
  box-shadow: none;
`;

const Title = styled.p`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: clamp(16px, 2.5vw, 18px);
  font-weight: 700;
`;

const SearchButton = styled.button`
  position: absolute;
  top: 50%;
  right: 13px;
  transform: translateY(-50%);
  cursor: pointer;
  border: none;
  background-color: #f6f6f6;
`;

const SearchIcon = styled.img`
  width: 24px;
  height: 24px;
`;
