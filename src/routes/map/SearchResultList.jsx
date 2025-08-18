import styled from "styled-components";
import StoreCard from "./StoreCard";

export default function SearchResultList({ stores, onSelect }) {
  if (!stores.length) return null;

  return (
    <SearchResultListWrapper>
      {stores.map((store) => (
        <StoreCard
          key={store.id || `${store.latitude},${store.longitude}`}
          store={store}
          isListMode
          onClick={() => onSelect?.(store)}
        />
      ))}
    </SearchResultListWrapper>
  );
}

const SearchResultListWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
