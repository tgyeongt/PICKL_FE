import styled from "styled-components";
import { useAtomValue } from "jotai";
import { selectedAddressAtom } from "./state/addressAtom";
import StoreCard from "./StoreCard";

export default function StoreListView({ stores }) {
  const address = useAtomValue(selectedAddressAtom);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 1000);
  };

  const sortedStores = stores
    .filter((store) => store.latitude && store.longitude)
    .map((store) => ({
      ...store,
      distance: getDistance(address.lat, address.lng, store.latitude, store.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);

  return (
    <StoreListViewWrapper>
      {sortedStores.map((store) => {
        return <StoreCard key={store.id} store={store} isListMode={true} />;
      })}
    </StoreListViewWrapper>
  );
}

const StoreListViewWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0 15px 20px; 
`;
