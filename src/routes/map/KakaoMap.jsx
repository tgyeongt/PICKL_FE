// ✅ 1. 필요한 import는 그대로 유지
import { useEffect, useRef, useState } from "react";
import {
  KakaoMapWrapper,
  KakaoMapBox,
  CurrentLocationButton,
  CurrentLocationIcon,
} from "./KakaoMap.styles";
import { useQuery } from "@tanstack/react-query";
import { APIService } from "../../shared/lib/api";
import { useAtom } from "jotai";
import { selectedCategoryAtom } from "./state/CategoryState";
import { mockStoresData } from "../../shared/lib/mock/stores.mock";
import CurrentLocationImg from "@icon/map/vector.svg";
import marketIcon from "@icon/map/selectMarket.svg";
import martIcon from "@icon/map/selectMart.svg";

export default function KakaoMap() {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedCategory] = useAtom(selectedCategoryAtom);

  const { data: storesData } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => (await APIService.public.get("/stores")).data,
    staleTime: 1000 * 60 * 5,
  });

  const isDev = import.meta.env.MODE === "development";
  const stores = storesData ?? (isDev ? mockStoresData : []);

  const overlayMapRef = useRef({ round: {}, bubble: null, bubbleTargetKey: null });

  const loadScript = () => {
    if (document.querySelector("script[src*='dapi.kakao.com']")) return Promise.resolve();
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${
        import.meta.env.VITE_KAKAOMAP_APP_KEY
      }&autoload=false`;
      script.async = true;
      script.onload = resolve;
      document.head.appendChild(script);
    });
  };

  const createMap = () => {
    window.kakao.maps.load(() => {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        const { latitude, longitude } = coords;
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(latitude, longitude),
          level: 3,
        });
        setMapInstance(map);
      });
    });
  };

  const createMarkerElement = (store, imageSrc) => {
    const marker = document.createElement("div");
    marker.style.cssText = `
      width: 50px; height: 50px; background: white; border-radius: 50%;
      display: flex; justify-content: center; align-items: center;
      box-shadow: 1px 1px 4px 0 var(--GREY10, #E1E1E3); cursor: pointer;
    `;
    const icon = document.createElement("img");
    icon.src = imageSrc;
    icon.alt = store.name;
    icon.style.width = "30px";
    icon.style.height = "30px";
    marker.appendChild(icon);
    return marker;
  };

  const createBubbleElement = (store, imageSrc) => {
    const bubble = document.createElement("div");
    bubble.innerHTML = `
      <div style="
        position: relative; background-color: #58D748; color: white;
        padding: 8px 20px; border-radius: 999px; font-weight: bold; font-size: 14px;
        display: inline-flex; align-items: center; justify-content: center; gap: 8px;
        box-shadow: 0 0 8px rgba(0,0,0,0.3); max-width: calc(100vw - 40px); white-space: nowrap;">
        <img src="${imageSrc}" style="width: 20px; height: 20px; margin-left: 2px;" />
        <span>${store.name}</span>
        <div style="position: absolute; bottom: -6px; left: 26px; width: 0; height: 0;
          border-left: 6px solid transparent; border-right: 6px solid transparent;
          border-top: 6px solid #58D748;"></div>
      </div>`;
    return bubble;
  };

  const showBubbleOverlay = (store, storePosition, imageSrc) => {
    const prevRound = overlayMapRef.current.round[`${store.latitude},${store.longitude}`];
    if (prevRound) {
      prevRound.setMap(null);
      prevRound.getContent()?.remove?.();
      delete overlayMapRef.current.round[`${store.latitude},${store.longitude}`];
    }

    const bubbleEl = createBubbleElement(store, imageSrc);
    const bubbleOverlay = new window.kakao.maps.CustomOverlay({
      position: storePosition,
      content: bubbleEl,
      yAnchor: 1.1,
    });
    bubbleOverlay.setMap(mapInstance);
    overlayMapRef.current.bubble = bubbleOverlay;
    overlayMapRef.current.bubbleTargetKey = `${store.latitude},${store.longitude}`;
  };

  const renderMarkers = () => {
    if (!mapInstance || !stores) return;
    markers.forEach((m) => m.setMap(null));
    Object.values(overlayMapRef.current.round).forEach((o) => o.setMap(null));
    overlayMapRef.current.round = {};

    const bounds = mapInstance.getBounds();
    const newMarkers = [];

    stores.forEach((store) => {
      const storeKey = `${store.latitude},${store.longitude}`;
      const storePosition = new window.kakao.maps.LatLng(store.latitude, store.longitude);
      if (!bounds.contain(storePosition)) return;
      if (selectedCategory !== "all" && store.type !== selectedCategory) return;

      if (overlayMapRef.current.bubbleTargetKey === storeKey) {
        if (overlayMapRef.current.bubble) newMarkers.push(overlayMapRef.current.bubble);
        return;
      }

      const imageSrc = store.type === "market" ? marketIcon : martIcon;
      const markerEl = createMarkerElement(store, imageSrc);
      const roundOverlay = new window.kakao.maps.CustomOverlay({
        position: storePosition,
        content: markerEl,
        yAnchor: 1,
      });
      roundOverlay.setMap(mapInstance);
      overlayMapRef.current.round[storeKey] = roundOverlay;

      markerEl.addEventListener("click", () => showBubbleOverlay(store, storePosition, imageSrc));
      newMarkers.push(roundOverlay);
    });
    setMarkers(newMarkers);
  };

  useEffect(() => {
    loadScript().then(createMap);
  }, []);

  useEffect(() => {
    if (!mapInstance) return;
    const handleIdle = () => renderMarkers();
    const handleMapClick = () => {
      const { bubble, bubbleTargetKey } = overlayMapRef.current;
      if (!bubble || !bubbleTargetKey) return;

      bubble.setMap(null);
      bubble.getContent()?.remove?.();
      overlayMapRef.current.bubble = null;

      const store = stores.find((s) => `${s.latitude},${s.longitude}` === bubbleTargetKey);
      if (!store) return;

      const imageSrc = store.type === "market" ? marketIcon : martIcon;
      const markerEl = createMarkerElement(store, imageSrc);
      const storePosition = new window.kakao.maps.LatLng(store.latitude, store.longitude);

      const roundOverlay = new window.kakao.maps.CustomOverlay({
        position: storePosition,
        content: markerEl,
        yAnchor: 1,
      });
      roundOverlay.setMap(mapInstance);
      overlayMapRef.current.round[bubbleTargetKey] = roundOverlay;

      markerEl.addEventListener("click", () => showBubbleOverlay(store, storePosition, imageSrc));
      overlayMapRef.current.bubbleTargetKey = null;
    };

    window.kakao.maps.event.addListener(mapInstance, "idle", handleIdle);
    window.kakao.maps.event.addListener(mapInstance, "click", handleMapClick);
    return () => {
      window.kakao.maps.event.removeListener(mapInstance, "idle", handleIdle);
      window.kakao.maps.event.removeListener(mapInstance, "click", handleMapClick);
    };
  }, [mapInstance, stores, selectedCategory]);

  return (
    <KakaoMapWrapper>
      <KakaoMapBox ref={mapRef} />
      <CurrentLocationButton
        onClick={() => {
          if (!mapInstance) return;
          navigator.geolocation.getCurrentPosition(({ coords }) => {
            const moveLatLng = new window.kakao.maps.LatLng(coords.latitude, coords.longitude);
            mapInstance.panTo(moveLatLng);
          });
        }}
      >
        <CurrentLocationIcon src={CurrentLocationImg} alt="현재 위치" />
      </CurrentLocationButton>
    </KakaoMapWrapper>
  );
}
