import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styled from "styled-components";
import backIcon from "@icon/map/backButtonIcon.svg";
import clearIcon from "@icon/map/x-circle.svg";
import useDebounce from "../map/hooks/useDebounce";
import { searchKeywordFromKakao } from "../../shared/lib/kakao";

export default function SearchLocationPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const debouncedKeyword = useDebounce(keyword, 300);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedKeyword) {
        setResults([]);
        return;
      }

      try {
        const res = await searchKeywordFromKakao(debouncedKeyword);
        setResults(res);
      } catch (err) {
        alert("카카오 장소 검색에 실패하였습니다.");
        console.log(err);
      }
    };

    fetchResults();
  }, [debouncedKeyword]);

  return (
    <SearchLocationWrapper>
      <SearchLocationTopBar>
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
      </SearchLocationTopBar>
      <ResultList>
        {results.map((place) => (
          <ResultItem key={place.id || place.place_name}>
            <PlaceName>{place.place_name}</PlaceName>
            <PlaceAddress>{place.address_name}</PlaceAddress>
          </ResultItem>
        ))}
      </ResultList>
    </SearchLocationWrapper>
  );
}

const SearchLocationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  padding: 13px 20px 0;
  overflow-y: auto;
`;

const SearchLocationTopBar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
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
  flex: 1;
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
  font-size: 13.5px;
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

const ResultList = styled.ul`
  margin-top: 16px;
`;

const ResultItem = styled.li`
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
`;

const PlaceName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
`;

const PlaceAddress = styled.div`
  font-size: 12px;
  color: #777;
  margin-top: 4px;
`;
