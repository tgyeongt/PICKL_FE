import styled from "styled-components";
import { useAtomValue } from "jotai";
import { selectedAddressAtom } from "./state/addressAtom";

export default function StoreCard({ store }) {
  const address = useAtomValue(selectedAddressAtom);

  if (!store || !address.lat || !address.lng) return null;

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 1000); // m
  };

  const formatDistance = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`);
  const formatTime = (min) =>
    min >= 60 ? `${Math.floor(min / 60)}시간 ${min % 60}분` : `${min}분`;

  const distance = getDistance(address.lat, address.lng, store.latitude, store.longitude);
  const walkMin = Math.max(1, Math.round(distance / 67));
  const driveMin = Math.max(1, Math.round(distance / 250));

  return (
    <CardWrapper>
      <Image src={store.imageUrl || "https://via.placeholder.com/100"} alt="상점 사진" />
      <Info>
        <Name>{store.name}</Name>
        <Address>{store.address || "서울시 성북구"} </Address>
        <DistanceBox>
          <span>
            📍 <strong>{formatDistance(distance)}</strong>
          </span>
          <span>
            도보 <strong>{formatTime(walkMin)}</strong>
          </span>
          <span>
            / 차로 <strong>{formatTime(driveMin)}</strong>
          </span>
        </DistanceBox>
      </Info>
    </CardWrapper>
  );
}

const CardWrapper = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  max-width: 768px;
  background-color: white;
  padding: 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 12px;
  align-items: center;
  z-index: 200;
`;

const Image = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Name = styled.h3`
  font-size: 16px;
  font-weight: bold;
`;

const Address = styled.p`
  font-size: 14px;
  color: #555;
`;

const DistanceBox = styled.div`
  font-size: 13px;
  color: #999;
  display: flex;
  gap: 8px;
  align-items: center;

  strong {
    color: #58d748;
    margin-left: 2px;
  }
`;
