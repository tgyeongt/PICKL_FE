import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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
import currentMarkerIcon from "@icon/map/currentLocationMarker.svg";

export default function KakaoMap() {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedCategory] = useAtom(selectedCategoryAtom);

  const markersRef = useRef([]);
  const currentMarkerRef = useRef(null);
  const overlayMapRef = useRef({ round: {}, bubble: null, bubbleTargetKey: null });

  const { data: storesData } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => (await APIService.public.get("/stores")).data,
    staleTime: 1000 * 60 * 5,
  });

  const isDev = import.meta.env.MODE === "development";
  const stores = useMemo(() => storesData ?? (isDev ? mockStoresData : []), [storesData, isDev]);

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
          draggable: true,
          scrollwheel: true,
        });
        setMapInstance(map);

        setTimeout(() => {
          window.kakao.maps.event.trigger(map, "resize");
        }, 100);
      });
    });
  };

  const createMarkerElement = (store, imageSrc) => {
    const marker = document.createElement("div");
    marker.style.cssText = `
      width: 50px; height: 50px; background: white; border-radius: 50%;
      display: flex; justify-content: center; align-items: center;
      box-shadow: 1px 1px 4px 0 var(--GREY10, #E1E1E3); cursor: pointer;
      transform: scale(0.8); opacity: 0; transition: opacity 0.3s ease, transform 0.3s ease;
    `;
    const icon = document.createElement("img");
    icon.src = imageSrc;
    icon.alt = store.name;
    icon.style.width = "30px";
    icon.style.height = "30px";
    marker.appendChild(icon);
    setTimeout(() => {
      marker.style.opacity = "1";
      marker.style.transform = "scale(1)";
    }, 10);
    return marker;
  };

  const createBubbleElement = (store, imageSrc) => {
    const bubble = document.createElement("div");
    bubble.innerHTML = `
      <div class="custom-bubble">
        <img src="${imageSrc}" style="width: 20px; height: 20px; margin-left: 2px;" />
        <span>${store.name}</span>
        <div style="position: absolute; bottom: -6px; left: 26px; width: 0; height: 0;
          border-left: 6px solid transparent; border-right: 6px solid transparent;
          border-top: 6px solid #58D748;"></div>
      </div>`;
    setTimeout(() => {
      bubble.querySelector(".custom-bubble")?.classList.add("show");
    }, 10);
    return bubble;
  };

  const showBubbleOverlay = useCallback(
    (store, storePosition, imageSrc) => {
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
    },
    [mapInstance]
  );

  const renderMarkers = useCallback(() => {
    if (!mapInstance || !stores) return;

    markersRef.current.forEach((m) => m.setMap(null));
    Object.values(overlayMapRef.current.round).forEach((o) => o.setMap(null));
    overlayMapRef.current.round = {};

    const bounds = mapInstance.getBounds();
    const newMarkers = [];

    stores.forEach((store) => {
      const storeKey = `${store.latitude},${store.longitude}`;
      if (selectedCategory !== "all" && store.type.toLowerCase() !== selectedCategory) return;

      const storePosition = new window.kakao.maps.LatLng(store.latitude, store.longitude);
      if (!bounds.contain(storePosition)) return;

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

    markersRef.current = newMarkers;
  }, [mapInstance, stores, selectedCategory, showBubbleOverlay]);

  useEffect(() => {
    if (!mapInstance) return;

    const watchId = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const { latitude, longitude } = coords;
        const position = new window.kakao.maps.LatLng(latitude, longitude);

        if (!currentMarkerRef.current) {
          const markerImage = new window.kakao.maps.MarkerImage(
            currentMarkerIcon,
            new window.kakao.maps.Size(40, 40),
            { offset: new window.kakao.maps.Point(20, 40) }
          );

          const marker = new window.kakao.maps.Marker({
            position,
            image: markerImage,
            zIndex: 10,
          });

          marker.setMap(mapInstance);
          currentMarkerRef.current = marker;
        } else {
          currentMarkerRef.current.setPosition(position);
        }
      },
      (err) => console.error("위치 추적 실패:", err),
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [mapInstance]);

  useEffect(() => {
    const loadKakaoMap = async () => {
      await loadScript();
      
      const checkKakaoLoaded = () =>
        new Promise((resolve) => {
          const interval = setInterval(() => {
            if (window.kakao && window.kakao.maps) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });

      await checkKakaoLoaded();
      createMap();
    };

    loadKakaoMap();
  }, []);

  useEffect(() => {
    if (!mapInstance) return;
    renderMarkers();
  }, [selectedCategory, renderMarkers, mapInstance]);

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
  }, [mapInstance, renderMarkers, showBubbleOverlay, stores]);

  return (
    <KakaoMapWrapper>
      <KakaoMapBox ref={mapRef} />
      <CurrentLocationButton
        onClick={() => {
          if (!mapInstance || !currentMarkerRef.current) return;
          const currentPos = currentMarkerRef.current.getPosition();
          mapInstance.panTo(currentPos);
        }}
      >
        <CurrentLocationIcon src={CurrentLocationImg} alt="현재 위치" />
      </CurrentLocationButton>
    </KakaoMapWrapper>
  );
}
