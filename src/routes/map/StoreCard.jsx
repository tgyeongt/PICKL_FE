import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { selectedAddressAtom } from "./state/addressAtom";
import selectMarket from "@icon/map/selectMarket.svg";
import selectMart from "@icon/map/selectMart.svg";
import distanceIcon from "@icon/map/distanceMarker.svg";
import styled from "styled-components";

export default function StoreCard({ store }) {
  const address = useAtomValue(selectedAddressAtom);
  const [resolvedAddress, setResolvedAddress] = useState(null);

  useEffect(() => {
    if (!store || !store.latitude || !store.longitude || store.address) return;

    const loadAddress = async () => {
      if (!window.kakao?.maps?.services) return;

      const geocoder = new window.kakao.maps.services.Geocoder();

      geocoder.coord2Address(store.longitude, store.latitude, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const road = result[0].road_address?.address_name;
          const jibun = result[0].address?.address_name;
          setResolvedAddress(road || jibun || "주소 없음");
        } else {
          setResolvedAddress("주소 없음");
        }
      });
    };

    loadAddress();
  }, [store]);

  if (!store || !address.lat || !address.lng) return null;

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

  const formatDistance = (m) => (m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`);
  const formatTime = (min) =>
    min >= 60 ? `${Math.floor(min / 60)}시간 ${min % 60}분` : `${min}분`;

  const distance = getDistance(address.lat, address.lng, store.latitude, store.longitude);
  const walkMin = Math.max(1, Math.round(distance / 67));
  const driveMin = Math.max(1, Math.round(distance / 250));

  const typeIcon = store.type === "market" ? selectMarket : selectMart;

  return (
    <StoreCardWrapper>
      <ImageWrapper>
        <StoreImage src={store.imageUrl || "https://via.placeholder.com/100"} alt="상점 사진" />
        <TypeIcon src={typeIcon} alt="타입 아이콘" />
      </ImageWrapper>

      <BottomBox>
        <StoreName>{store.name}</StoreName>
        <StoreAddress>{store.address || resolvedAddress || "주소 불러오는 중..."}</StoreAddress>
        <DetailInfoBox>
          <InfoBox>
            <DistanceIcon src={distanceIcon} alt="위치 아이콘" />
            <InfoText>{formatDistance(distance)}</InfoText>
          </InfoBox>
          <InfoBox>
            <ByText>도보</ByText>
            <InfoText>{formatTime(walkMin)}</InfoText>
          </InfoBox>
          <InfoBox>
            <ByText>차량</ByText>
            <InfoText>{formatTime(driveMin)}</InfoText>
          </InfoBox>
        </DetailInfoBox>
      </BottomBox>
    </StoreCardWrapper>
  );
}

const StoreCardWrapper = styled.div`
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 768px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 200;
`;

const ImageWrapper = styled.div`
  position: relative;
`;

const StoreImage = styled.img`
  width: 100%;
  height: 132.03px;
  object-fit: cover;
`;

const TypeIcon = styled.img`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 12px;
  padding: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
`;

const BottomBox = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const StoreName = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: #1c1b1a;
`;

const StoreAddress = styled.p`
  font-size: 13px;
  color: #757575;
`;

const DetailInfoBox = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-top: 4px;
`;

const InfoBox = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DistanceIcon = styled.img`
  width: 16px;
  height: 16px;
`;

const InfoText = styled.p`
  font-size: 13px;
  color: #58d748;
`;

const ByText = styled.p`
  font-size: 13px;
  color: #757575;
`;
