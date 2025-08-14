import { useState } from "react";
import styled from "styled-components";
import useDebounce from "@hooks/useDebounce";
import ItemCard from "./ItemCard";
import Suggestion from "./Suggestion";
import SearchIcon from "@icon/search/search_icon.svg";
import ClearIcon from "@icon/search/clear_icon.svg";
import sampleItems from "./sampleItems";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 200);
  const showClearButton = searchQuery.length > 0;

  const [itemList] = useState(sampleItems);
  const isSearching = debouncedSearchQuery.length > 0;

  const filteredList = itemList.filter((item) =>
    item.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  // API 호출 예시
  // useEffect(() => {
  //   const fetchItems = async () => {
  //     const { data } = await publicAPI.get("items", { params: { q: debouncedSearchQuery } });
  //     setItemList(data);
  //   };
  //   fetchItems();
  // }, [debouncedSearchQuery]);

  return (
    <Wrapper>
      <SearchSection>
        <SearchBox
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="오늘의 식재료 찾기"
        />
        <SearchBtn>
          {showClearButton && (
            <img src={ClearIcon} alt="검색어 지우기" onClick={() => setSearchQuery("")} />
          )}
          {!showClearButton && <img src={SearchIcon} alt="검색" />}
        </SearchBtn>
      </SearchSection>

      {!isSearching && <Suggestion />}

      {isSearching && (
        <ItemWrapper>
          {filteredList.length > 0 ? (
            filteredList.map((item) => (
              <ItemCard
                id={item.id}
                key={item.id}
                title={item.title}
                unit={item.unit}
                img={item.img}
                price={item.price}
              />
            ))
          ) : (
            <NoResultMessage>결과가 존재하지 않습니다</NoResultMessage>
          )}
        </ItemWrapper>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const SearchSection = styled.div`
  display: flex;
  width: 100%;
  background-color: #eaeaed;
  padding: 2px 5px;
  justify-content: space-between;
  align-items: center;
  border-radius: 15px;
  margin-top: 20px;
`;

const SearchBox = styled.input`
  width: 100%;
  padding: 5px 13px;
  font-size: 15px;
  font-weight: 500;

  &::-webkit-search-cancel-button {
    -webkit-appearance: none;
    appearance: none;
  }

  &::placeholder {
    color: #adadaf;
  }
`;

const SearchBtn = styled.button`
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin-right: 10px;
`;

const ItemWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px 0;
`;

const NoResultMessage = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 20px 0;
  color: #888;
  font-size: 16px;
`;
