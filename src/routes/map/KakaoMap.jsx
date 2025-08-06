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
    queryFn: async () => {
      const res = await APIService.public.get("/stores");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const isDev = import.meta.env.MODE === "development";
  const stores = storesData ?? (isDev ? mockStoresData : []);

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

  const handleMoveToCurrentLocation = () => {
    if (!mapInstance) return;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const { latitude, longitude } = coords;
      const moveLatLng = new window.kakao.maps.LatLng(latitude, longitude);
      mapInstance.panTo(moveLatLng);
    });
  };

  const overlayMapRef = useRef({
    round: {},
    bubble: null,
    bubbleTargetKey: null,
  });

  const renderMarkers = () => {
    if (!mapInstance || !stores) return;

    markers.forEach((marker) => {
      marker.setMap(null);
      marker.getContent()?.remove?.();
    });

    Object.values(overlayMapRef.current.round).forEach((overlay) => {
      overlay.setMap(null);
      overlay.getContent()?.remove?.();
    });
    overlayMapRef.current.round = {};

    const bounds = mapInstance.getBounds();
    const newMarkers = [];

    stores.forEach((store) => {
      const storeKey = `${store.latitude},${store.longitude}`;
      const storePosition = new window.kakao.maps.LatLng(store.latitude, store.longitude);

      if (!bounds.contain(storePosition)) return;
      if (selectedCategory !== "all" && store.type !== selectedCategory) return;

      const imageSrc = store.type === "market" ? marketIcon : martIcon;

      if (overlayMapRef.current.bubbleTargetKey === storeKey) {
        if (overlayMapRef.current.bubble) {
          newMarkers.push(overlayMapRef.current.bubble);
        }
        return;
      }

      const markerEl = document.createElement("div");
      markerEl.style.width = "50px";
      markerEl.style.height = "50px";
      markerEl.style.background = "#ffffff";
      markerEl.style.borderRadius = "50%";
      markerEl.style.display = "flex";
      markerEl.style.justifyContent = "center";
      markerEl.style.alignItems = "center";
      markerEl.style.boxShadow = "1px 1px 4px 0 var(--GREY10, #E1E1E3)";
      markerEl.style.cursor = "pointer";

      const iconEl = document.createElement("img");
      iconEl.src = imageSrc;
      iconEl.alt = store.name;
      iconEl.style.width = "30px";
      iconEl.style.height = "30px";
      markerEl.appendChild(iconEl);

      const roundOverlay = new window.kakao.maps.CustomOverlay({
        position: storePosition,
        content: markerEl,
        yAnchor: 1,
      });

      roundOverlay.setMap(mapInstance);
      newMarkers.push(roundOverlay);
      overlayMapRef.current.round[storeKey] = roundOverlay;

      markerEl.addEventListener("click", () => {
        if (overlayMapRef.current.bubble) {
          overlayMapRef.current.bubble.setMap(null);
          overlayMapRef.current.bubble.getContent()?.remove?.();
          overlayMapRef.current.bubble = null;
          overlayMapRef.current.bubbleTargetKey = null;
        }

        const prevRound = overlayMapRef.current.round[storeKey];
        if (prevRound) {
          prevRound.setMap(null);
          prevRound.getContent()?.remove?.();
          delete overlayMapRef.current.round[storeKey];
        }

        const bubbleEl = document.createElement("div");
        bubbleEl.innerHTML = `
          <div style="
            position: relative;
            background-color: #58D748;
            color: white;
            padding: 8px 20px 8px 20px;
            border-radius: 999px;
            font-weight: bold;
            font-size: 14px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-shadow: 0 0 8px rgba(0,0,0,0.3);
            max-width: calc(100vw - 40px);
            white-space: nowrap;
          ">
            <img src="${imageSrc}" style="width: 20px; height: 20px; margin-left: 2px;" />
            <span>${store.name}</span>
            <div style="
              position: absolute;
              bottom: -6px;
              left: 26px;
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 6px solid #58D748;
            "></div>
          </div>
        `;

        const bubbleOverlay = new window.kakao.maps.CustomOverlay({
          position: storePosition,
          content: bubbleEl,
          yAnchor: 1.1,
        });

        bubbleOverlay.setMap(mapInstance);
        overlayMapRef.current.bubble = bubbleOverlay;
        overlayMapRef.current.bubbleTargetKey = storeKey;

        renderMarkers();
      });
    });

    setMarkers(newMarkers);
  };

  useEffect(() => {
    if (!mapInstance) return;
    const handleIdle = () => renderMarkers();
    window.kakao.maps.event.addListener(mapInstance, "idle", handleIdle);
    return () => window.kakao.maps.event.removeListener(mapInstance, "idle", handleIdle);
  }, [mapInstance, stores, selectedCategory]);

  return (
    <KakaoMapWrapper>
      <KakaoMapBox ref={mapRef} />
      <CurrentLocationButton onClick={handleMoveToCurrentLocation}>
        <CurrentLocationIcon src={CurrentLocationImg} alt="현재 위치" />
      </CurrentLocationButton>
    </KakaoMapWrapper>
  );
}
