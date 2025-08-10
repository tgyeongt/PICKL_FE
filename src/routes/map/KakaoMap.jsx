import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { selectedCategoryAtom } from "./state/CategoryState";
import { selectedAddressAtom } from "./state/addressAtom";
import {
  KakaoMapWrapper,
  KakaoMapBox,
  CurrentLocationButton,
  CurrentLocationIcon,
  StoreListButton,
  StoreListIcon,
  StoreListText,
} from "./KakaoMap.styles";
import { useQuery } from "@tanstack/react-query";
import { APIService } from "../../shared/lib/api";
import { mapMarketFromAPI } from "../../shared/lib/storeMappers";
import { testLoginIfNeeded } from "../../shared/lib/auth";

import StoreCard from "./StoreCard";
import StoreListView from "./StoreListView";
import CurrentLocationImg from "@icon/map/vector.svg";
import marketIcon from "@icon/map/selectMarket.svg";
import martIcon from "@icon/map/selectMart.svg";
import currentMarkerIcon from "@icon/map/currentLocationMarker.svg";
import StoreListImg from "@icon/map/storeListIcon.svg";

export default function KakaoMap() {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedCategory] = useAtom(selectedCategoryAtom);
  const [isListMode, setIsListMode] = useState(false);
  const addressState = useAtomValue(selectedAddressAtom);
  const setSelectedAddress = useSetAtom(selectedAddressAtom);

  const markersRef = useRef([]);
  const currentMarkerRef = useRef(null);
  const overlayMapRef = useRef({ round: {}, bubble: null, bubbleTargetKey: null });

  const [bbox, setBbox] = useState(null);

  const ensureKakaoReady = () =>
    new Promise((resolve) => {
      const onReady = () => window.kakao.maps.load(resolve);
      if (window.kakao?.maps?.services) return onReady();

      document.querySelectorAll("script[data-kakao-maps-sdk]").forEach((s) => s.remove());

      const script = document.createElement("script");
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${
        import.meta.env.VITE_KAKAOMAP_APP_KEY
      }&libraries=services&autoload=false`;
      script.async = true;
      script.setAttribute("data-kakao-maps-sdk", "true");
      script.onload = onReady;
      document.head.appendChild(script);
    });

  const waitForContainerSize = () =>
    new Promise((resolve) => {
      const check = () => {
        const el = mapRef.current;
        if (el && el.offsetWidth > 0 && el.offsetHeight > 0) return resolve();
        requestAnimationFrame(check);
      };
      check();
    });

  const createMap = useCallback(() => {
    if (!mapRef.current || !mapRef.current.isConnected) return;
    const defaultLat = addressState.lat || 37.5665;
    const defaultLng = addressState.lng || 126.978;

    const centerLatLng = new window.kakao.maps.LatLng(defaultLat, defaultLng);

    const map = new window.kakao.maps.Map(mapRef.current, {
      center: centerLatLng,
      level: 3,
      draggable: true,
      scrollwheel: true,
    });

    setMapInstance(map);
    map.setCenter(centerLatLng);

    setTimeout(() => {
      window.kakao.maps.event.trigger(map, "resize");
    }, 100);
  }, [addressState.lat, addressState.lng]);

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
      <style>
        .custom-bubble{
          position:relative; display:flex; gap:6px; align-items:center;
          padding:8px 12px; border-radius:20px; background:#58D748; color:#fff;
          box-shadow: 1px 1px 4px rgba(0,0,0,0.1); transform: translateY(6px);
          opacity:0; transition: all .2s ease;
        }
        .custom-bubble.show{ opacity:1; transform: translateY(0); }
      </style>
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

      const offsetLat = 0.002;
      const adjustedLat = store.latitude - offsetLat;
      const adjustedCenter = new window.kakao.maps.LatLng(adjustedLat, store.longitude);
      mapInstance?.panTo(adjustedCenter);

      const bubbleEl = createBubbleElement(store, imageSrc);
      const bubbleOverlay = new window.kakao.maps.CustomOverlay({
        position: storePosition,
        content: bubbleEl,
        yAnchor: 1.1,
      });
      bubbleOverlay.setMap(mapInstance);

      overlayMapRef.current.bubble = bubbleOverlay;
      overlayMapRef.current.bubbleTargetKey = `${store.latitude},${store.longitude}`;
      setSelectedStore(store);
    },
    [mapInstance]
  );

  const renderMarkers = useCallback(
    (stores) => {
      if (!mapInstance || !stores) return;

      markersRef.current.forEach((m) => m.setMap?.(null));
      Object.values(overlayMapRef.current.round).forEach((o) => o.setMap?.(null));
      overlayMapRef.current.round = {};

      const bounds = mapInstance.getBounds();
      const newMarkers = [];

      stores.forEach((store) => {
        const storeKey = `${store.latitude},${store.longitude}`;
        if (selectedCategory !== "all" && (store.type || "").toLowerCase() !== selectedCategory)
          return;

        const storePosition = new window.kakao.maps.LatLng(store.latitude, store.longitude);
        if (!bounds.contain(storePosition)) return;

        if (overlayMapRef.current.bubbleTargetKey === storeKey) {
          if (overlayMapRef.current.bubble) newMarkers.push(overlayMapRef.current.bubble);
          return;
        }

        const imageSrc = (store.type || "").toLowerCase() === "market" ? marketIcon : martIcon;
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
    },
    [mapInstance, selectedCategory, showBubbleOverlay]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      await ensureKakaoReady();
      if (!mounted) return;
      await waitForContainerSize();
      if (!mounted || isListMode) return;

      createMap();

      if (!addressState?.isManual) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const { latitude, longitude } = coords;
            const geocoder = new window.kakao.maps.services.Geocoder();
            geocoder.coord2Address(longitude, latitude, (result, status) => {
              if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
                setSelectedAddress({
                  roadAddress: result[0].road_address?.address_name || "",
                  jibunAddress: result[0].address?.address_name || "",
                  lat: latitude,
                  lng: longitude,
                  isManual: false,
                });
              }
            });
          },
          () => {
            setSelectedAddress({
              roadAddress: "서울특별시 중구 세종대로",
              jibunAddress: "",
              lat: 37.5665,
              lng: 126.978,
              isManual: false,
            });
          }
        );
      }
    })();
    return () => {
      mounted = false;
    };
  }, [createMap, setSelectedAddress, addressState?.isManual, isListMode]);

  useEffect(() => {
    if (!mapInstance || !addressState.lat || !addressState.lng) return;
    const newCenter = new window.kakao.maps.LatLng(addressState.lat, addressState.lng);
    mapInstance.setCenter(newCenter);
  }, [mapInstance, addressState.lat, addressState.lng]);

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
          currentMarkerRef.current.setMap(mapInstance);
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [mapInstance]);

  useEffect(() => {
    if (!mapInstance) return;

    const handleIdle = () => {
      const b = mapInstance.getBounds?.();
      if (!b) return;
      const sw = b.getSouthWest();
      const ne = b.getNorthEast();
      setBbox({
        minX: sw.getLng(),
        minY: sw.getLat(),
        maxX: ne.getLng(),
        maxY: ne.getLat(),
      });
    };

    window.kakao.maps.event.addListener(mapInstance, "idle", handleIdle);
    handleIdle();

    return () => {
      window.kakao.maps.event.removeListener(mapInstance, "idle", handleIdle);
    };
  }, [mapInstance]);

  const {
    data: storesData = [],
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["markets", bbox?.minX, bbox?.minY, bbox?.maxX, bbox?.maxY],
    enabled: !!mapInstance && !!bbox,
    queryFn: async () => {
      try {
        await testLoginIfNeeded();
      } catch (e) {
        console.warn(
          "[auth] test-login 실패(개발 환경 CORS 가능). 토큰 없이 진행, 빈 데이터일 수 있음.",
          e
        );
      }

      const params = { ...bbox, page: 1, size: 200 };
      try {
        const res = await APIService.private.get("/markets", { params });
        const raw = Array.isArray(res) ? res : res?.data ?? res?.content ?? res?.items ?? res ?? [];

        return Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : [];
      } catch (e) {
        console.warn("[/markets] 호출 실패:", e);
        return [];
      }
    },
    select: (raw) => raw.map(mapMarketFromAPI).filter(Boolean),
    staleTime: 60 * 1000,
  });

  const filteredStores = useMemo(() => {
    if (selectedCategory === "all") return storesData;
    return storesData.filter((s) => (s.type || "").toLowerCase() === selectedCategory);
  }, [storesData, selectedCategory]);

  useEffect(() => {
    renderMarkers(filteredStores);
  }, [filteredStores, renderMarkers]);

  useEffect(() => {
    if (!mapInstance) return;

    const handleMapClick = () => {
      const { bubble, bubbleTargetKey } = overlayMapRef.current;
      if (!bubble || !bubbleTargetKey) return;

      bubble.setMap(null);
      bubble.getContent()?.remove?.();
      overlayMapRef.current.bubble = null;

      setSelectedStore(null);

      const store = filteredStores.find((s) => `${s.latitude},${s.longitude}` === bubbleTargetKey);
      if (!store) return;

      const imageSrc = (store.type || "").toLowerCase() === "market" ? marketIcon : martIcon;
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
      mapInstance.panTo(storePosition);
    };

    window.kakao.maps.event.addListener(mapInstance, "click", handleMapClick);
    return () => {
      window.kakao.maps.event.removeListener(mapInstance, "click", handleMapClick);
    };
  }, [mapInstance, filteredStores, showBubbleOverlay]);

  useEffect(() => {
    if (!isListMode && !mapInstance && addressState.lat && addressState.lng) {
      (async () => {
        await ensureKakaoReady();
        await waitForContainerSize();
        createMap();
      })();
    }
  }, [isListMode, mapInstance, addressState.lat, addressState.lng, createMap]);

  return (
    <KakaoMapWrapper $isListMode={isListMode}>
      {isListMode ? (
        <>
          {console.log("🔥 필터된 상점들", filteredStores, { isFetching })}
          <StoreListView stores={filteredStores} />
        </>
      ) : (
        <>
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
          <StoreCard store={selectedStore} />
        </>
      )}

      <StoreListButton
        $isListMode={isListMode}
        $isCardVisible={!!selectedStore || isListMode}
        onClick={() => {
          setSelectedStore(null);
          setMapInstance(null);
          setIsListMode((prev) => !prev);
          setTimeout(() => refetch(), 0);
        }}
      >
        <StoreListIcon src={StoreListImg} alt="목록 아이콘" />
        <StoreListText>{isListMode ? "지도보기" : "목록보기"}</StoreListText>
      </StoreListButton>
    </KakaoMapWrapper>
  );
}
