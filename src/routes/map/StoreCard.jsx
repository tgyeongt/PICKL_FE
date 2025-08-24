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
    console.log("=== getStoreImage 디버깅 ===");
    console.log("store:", store);
    console.log("store.type:", store.type);
    console.log("store.imageUrl:", store.imageUrl);
    console.log("store.imageUrl 타입:", typeof store.imageUrl);
    console.log("store.imageUrl 길이:", store.imageUrl?.length);
    console.log("store.imageUrl이 빈 문자열인가?", store.imageUrl === "");
    console.log("store.imageUrl이 공백만 있는가?", store.imageUrl?.trim() === "");
    console.log("store.imageUrl이 null인가?", store.imageUrl === null);
    console.log("store.imageUrl이 undefined인가?", store.imageUrl === undefined);

    // 백엔드 API 응답 전체 구조 확인
    console.log("=== 백엔드 API 응답 구조 분석 ===");
    console.log("store 객체의 모든 키:", Object.keys(store));
    console.log("store 객체의 모든 값:", Object.values(store));

    // 대형마트인 경우 백엔드 이미지 URL 우선 사용
    if (store.type === "mart") {
      console.log("=== 대형마트 타입 처리 ===");
      if (store.imageUrl && store.imageUrl.trim() !== "") {
        console.log("✅ 대형마트 타입 - 백엔드 imageUrl 사용 성공:", store.imageUrl);
        console.log("이미지 URL 유효성 검사 통과");
        return store.imageUrl;
      } else {
        console.log("❌ 대형마트 타입이지만 imageUrl 없음 또는 빈 문자열");
        console.log("imageUrl 값:", JSON.stringify(store.imageUrl));
        console.log("imageUrl 길이:", store.imageUrl?.length);
        console.log("trim() 결과:", store.imageUrl?.trim());
        console.log("fallback으로 selectMart 아이콘 사용");
        return martImg;
      }
    }

    // 전통시장인 경우 기본 이미지 사용
    if (store.type === "market") {
      console.log("=== 전통시장 타입 처리 ===");
      console.log("✅ 전통시장 타입 - marketImg 사용");
      return marketImg;
    }

    // 타입이 명확하지 않은 경우 백엔드 이미지가 있으면 사용, 없으면 기본 이미지
    console.log("=== 타입 불명확 처리 ===");
    if (store.imageUrl && store.imageUrl.trim() !== "") {
      console.log("✅ 타입 불명확 - 백엔드 imageUrl 사용:", store.imageUrl);
      return store.imageUrl;
    }

    console.log("❌ 타입 불명확 + 백엔드 이미지 없음 - marketImg 사용");
    return marketImg;
  };

  const storeImg = getStoreImage();

  // 디버깅을 위한 로그 추가
  console.log("=== StoreCard 최종 렌더링 정보 ===");
  console.log("store 객체:", store);
  console.log("store.type:", store.type);
  console.log("store.name:", store.name);
  console.log("store.id:", store.id);
  console.log("store.imageUrl:", store.imageUrl);
  console.log("marketImg:", marketImg);
  console.log("martImg:", martImg);
  console.log("최종 storeImg:", storeImg);
  console.log("이미지 로딩 시도 URL:", storeImg);

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
            console.error("=== 이미지 로딩 실패 ===");
            console.error("실패한 이미지 URL:", storeImg);
            console.error("store 타입:", store.type);
            console.error("store 이름:", store.name);
            console.error("store ID:", store.id);

            // mart 타입이면 selectMart 아이콘으로 fallback
            if (store.type === "mart") {
              console.log("🔄 대형마트 이미지 로딩 실패 - selectMart 아이콘으로 fallback");
              console.log("fallback 이미지:", martImg);
              e.target.src = martImg;
              return;
            }
            // 전통시장이나 기타 타입의 경우에만 기본 이미지로 fallback
            console.log("🔄 전통시장/기타 타입 이미지 로딩 실패 - 기본 이미지로 fallback");
            console.log("fallback 이미지:", marketImg);
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
