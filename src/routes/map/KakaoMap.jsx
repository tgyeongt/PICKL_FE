import { useEffect, useRef, useState } from "react";
import {
  KakaoMapWrapper,
  KakaoMapBox,
  CurrentLocationButton,
  CurrentLocationIcon,
} from "./KakaoMap.styles";

import { useQuery } from "@tanstack/react-query";
import { APIService } from "../../shared/lib/api";

import CurrentLocationImg from "@icon/map/vector.png";
import marketIcon from "@icon/map/selectMarket.png";
import martIcon from "@icon/map/selectMart.png";

// 전역 상태 관리에서 받아왔다고 가정
import { useAtom } from "jotai";
import { selectedCategoryAtom } from "./state/CategoryState";

export default function KakaoMap() {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedCategory] = useAtom(selectedCategoryAtom); // "all" | "market" | "mart"

  // ✅ 백엔드에서 상점 데이터 불러오기
  const { data: storesData } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const res = await APIService.public.get("/stores"); // 예: /stores
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // ✅ KakaoMap SDK 로딩 및 지도 생성
  const loadScript = () => {
    if (document.querySelector("script[src*='dapi.kakao.com']")) return Promise.resolve();

    return new Promise((resolve) => {
      const script = document.createElement("script");
      const appKey = import.meta.env.VITE_KAKAOMAP_APP_KEY;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false`;
      script.async = true;
      script.onload = resolve;
      document.head.appendChild(script);
    });
  };

  const createMap = () => {
    window.kakao.maps.load(() => {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        const container = mapRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(latitude, longitude),
          level: 3,
        };
        const map = new window.kakao.maps.Map(container, options);
        setMapInstance(map);
      });
    });
  };

  useEffect(() => {
    loadScript().then(createMap);
  }, []);

  // ✅ 현재 위치로 이동
  const handleMoveToCurrentLocation = () => {
    if (!mapInstance) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const { latitude, longitude } = coords;
      const moveLatLng = new window.kakao.maps.LatLng(latitude, longitude);
      mapInstance.panTo(moveLatLng);
    });
  };

  // ✅ 마커 렌더링
  const renderMarkers = () => {
    if (!mapInstance || !storesData) return;

    // 1. 기존 마커 제거
    markers.forEach((marker) => marker.setMap(null));

    // 2. 현재 지도의 bounds 구하기
    const bounds = mapInstance.getBounds();
    const newMarkers = [];

    // 3. 데이터 필터링 및 마커 생성
    storesData.forEach((store) => {
      const storePosition = new window.kakao.maps.LatLng(store.latitude, store.longitude);

      // ✅ 현재 뷰포트 안에 있는가?
      if (!bounds.contain(storePosition)) return;

      // ✅ 선택된 카테고리 필터
      if (selectedCategory !== "all" && store.type !== selectedCategory) return;

      // ✅ 아이콘 설정
      const imageSrc = store.type === "market" ? marketIcon : martIcon;
      const imageSize = new window.kakao.maps.Size(40, 40);
      const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);

      // ✅ 마커 생성
      const marker = new window.kakao.maps.Marker({
        map: mapInstance,
        position: storePosition,
        image: markerImage,
        title: store.name,
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  };

  // ✅ 지도가 이동된 후에 마커 렌더링 (idle 이벤트)
  useEffect(() => {
    if (!mapInstance) return;

    const handleIdle = () => {
      renderMarkers();
    };

    window.kakao.maps.event.addListener(mapInstance, "idle", handleIdle);

    return () => {
      window.kakao.maps.event.removeListener(mapInstance, "idle", handleIdle);
    };
  }, [mapInstance, storesData, selectedCategory]);

  return (
    <KakaoMapWrapper>
      <KakaoMapBox ref={mapRef} />
      <CurrentLocationButton onClick={handleMoveToCurrentLocation}>
        <CurrentLocationIcon src={CurrentLocationImg} alt="현재 위치" />
      </CurrentLocationButton>
    </KakaoMapWrapper>
  );
}
