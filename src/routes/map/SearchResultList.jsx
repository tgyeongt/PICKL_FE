import styled from "styled-components";
import StoreCard from "./StoreCard";

export default function SearchResultList({ stores }) {
  if (!stores.length) return null;

  return (
    <SearchResultListWrapper>
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} isListMode />
      ))}
    </SearchResultListWrapper>
  );
}

const SearchResultListWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;
