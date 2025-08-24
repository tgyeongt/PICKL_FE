import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import styled from "styled-components";
import useDebounce from "@hooks/useDebounce";
import ItemCard from "./ItemCard";
import Suggestion from "./Suggestion";
import SearchIcon from "@icon/search/search_icon.svg";
import ClearIcon from "@icon/search/clear_icon.svg";
import { APIService } from "../../shared/lib/api";

export default function Search() {
  const { state } = useLocation();
  const [searchQuery, setSearchQuery] = useState(state?.searchQuery || "");
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 200);
  const showClearButton = searchQuery.length > 0;
  const navigate = useNavigate();

  const [itemList, setItemList] = useState([]);
  const isSearching = debouncedSearchQuery.length > 0;

  const filteredList = itemList.filter((item) =>
    item.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  );

  const handleSelectItem = (itemId) => {
    navigate(`/search/ingredients/${itemId}`);
  };

  useEffect(() => {
    const fetchItems = async () => {
      if (!debouncedSearchQuery) {
        setItemList([]);
        return;
      }

      try {
        const res = await APIService.private.get("/daily-price-change/store/items/search", {
          params: {
            name: debouncedSearchQuery,
          },
        });

        if (res.success) {
          const mapped = res.data.map((item) => ({
            productNo: item.productNo,
            title: item.productName,
            unit: item.unit,
            img: item.imageUrl,
            price: item.latestPrice,
          }));
          setItemList(mapped);
        } else {
          setItemList([]);
        }
      } catch (err) {
        console.error("검색 API 호출 실패:", err);
        setItemList([]);
      }
    };

    fetchItems();
  }, [debouncedSearchQuery]);

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

      {!isSearching && <Suggestion onSelectItem={handleSelectItem} />}

      {isSearching && (
        <ItemWrapper>
          {filteredList.length > 0 ? (
            filteredList.map((item) => (
              <ItemCard
                productNo={item.productNo}
                key={item.productNo}
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
  padding: 0 20px;
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
  padding: 20px 0 80px 0;
`;

const NoResultMessage = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 20px 0;
  color: #888;
  font-size: 16px;
`;
