import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { selectedAddressAtom } from "./state/addressAtom";
import selectMarket from "@icon/map/selectMarket.svg";
import selectMart from "@icon/map/selectMart.svg";
import distanceIcon from "@icon/map/distanceMarker.svg";
import marketImg from "@image/marketImage.png";
import martImg from "@image/martImage.png";

import {
  StoreCardWrapper,
  ImageWrapper,
  StoreImage,
  TypeIcon,
  BottomBox,
  StoreName,
  StoreAddress,
  DetailInfoBox,
  InfoBox,
  DistanceIcon,
  InfoText,
  ByText,
} from "./StoreCard.styles";

export default function StoreCard({ store, isListMode = false, onClick }) {
  const address = useAtomValue(selectedAddressAtom);
  const [resolvedAddress, setResolvedAddress] = useState(null);
  const [showClass, setShowClass] = useState(false);

  useEffect(() => {
    if (store) {
      const timer = setTimeout(() => setShowClass(true), 30);
      return () => {
        clearTimeout(timer);
        setShowClass(false);
      };
    }
  }, [store]);

  useEffect(() => {
    if (!store || !store.latitude || !store.longitude) return;

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

  if (!store) return null;

  const hasValidAddress = address?.lat && address?.lng;

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

  const formatDistance = (m) => {
    if (m === null || m === undefined) return "거리 정보 없음";
    return m >= 1000 ? `${(m / 1000).toFixed(1)}km` : `${m}m`;
  };

  const formatTime = (min) => {
    if (min === null || min === undefined) return "시간 정보 없음";
    if (min >= 1440) {
      const days = Math.floor(min / 1440);
      const hours = Math.floor((min % 1440) / 60);
      const minutes = min % 60;
      return `${days}일 ${hours}시간 ${minutes}분`;
    } else if (min >= 60) {
      return `${Math.floor(min / 60)}시간 ${min % 60}분`;
    } else {
      return `${min}분`;
    }
  };

  let distance = null;
  let walkMin = null;
  let driveMin = null;

  if (hasValidAddress) {
    distance = getDistance(address.lat, address.lng, store.latitude, store.longitude);
    walkMin = Math.max(1, Math.round(distance / 67));
    driveMin = Math.max(1, Math.round(distance / 250));
  }

  const typeIcon = store.type === "market" ? selectMarket : selectMart;

  // 이미지 URL 유효성 검사 및 fallback 로직 개선
  const getStoreImage = () => {
    // 대형마트인 경우 백엔드 이미지 URL 우선 사용
    if (store.type === "mart") {
      if (store.imageUrl && store.imageUrl.trim() !== "") {
        return store.imageUrl;
      } else {
        return martImg;
      }
    }

    // 전통시장인 경우 기본 이미지 사용
    if (store.type === "market") {
      return marketImg;
    }

    // 타입이 명확하지 않은 경우 백엔드 이미지가 있으면 사용, 없으면 기본 이미지
    if (store.imageUrl && store.imageUrl.trim() !== "") {
      return store.imageUrl;
    }

    return marketImg;
  };

  const storeImg = getStoreImage();

  return (
    <StoreCardWrapper
      className={showClass ? "show" : ""}
      $isListMode={isListMode}
      onClick={isListMode ? onClick : undefined}
      role={isListMode ? "button" : undefined}
      tabIndex={isListMode ? 0 : undefined}
      style={isListMode ? { cursor: "pointer" } : undefined}
    >
      <ImageWrapper>
        <StoreImage
          src={storeImg}
          alt="상점 사진"
          onError={(e) => {
            // mart 타입이면 selectMart 아이콘으로 fallback
            if (store.type === "mart") {
              e.target.src = martImg;
              return;
            }
            // 전통시장이나 기타 타입의 경우에만 기본 이미지로 fallback
            e.target.src = marketImg;
          }}
        />
        <TypeIcon src={typeIcon} alt="타입 아이콘" />
      </ImageWrapper>
      <BottomBox>
        <StoreName>{store.name}</StoreName>
        <StoreAddress>{store.address || resolvedAddress || "주소 불러오는 중"}</StoreAddress>
        {hasValidAddress ? (
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
        ) : (
          <DetailInfoBox>
            <InfoBox>
              <DistanceIcon src={distanceIcon} alt="위치 아이콘" />
              <InfoText>현재 위치를 확인할 수 없습니다</InfoText>
            </InfoBox>
          </DetailInfoBox>
        )}
      </BottomBox>
    </StoreCardWrapper>
  );
}
