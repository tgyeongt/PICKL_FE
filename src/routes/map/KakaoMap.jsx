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

  const markersRef = useRef([]); // 둥근 마커 overlays만 관리
  const currentMarkerRef = useRef(null);
  const overlayMapRef = useRef({
    round: {}, // key: "lat,lng" -> CustomOverlay(동그란 마커)
    bubble: null, // 말풍선 CustomOverlay
    bubbleTargetKey: null, // 현재 말풍선 대상 key
  });
  const justOpenedAtRef = useRef(0); // 말풍선 방금 열린 시각(지도 클릭 무시용)

  const [bbox, setBbox] = useState(null);

  // ---------- Kakao SDK 준비 ----------
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

  // ---------- 맵 생성 ----------
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

  // ---------- 커스텀 마커 / 버블 ----------
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
    marker.addEventListener("click", (e) => e.stopPropagation()); // 전파 차단

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
          padding:8px 21px; border-radius:20px; background:#58D748; color:#fff;
          box-shadow: 1px 1px 4px rgba(0,0,0,0.1); transform: translateY(6px);
          opacity:0; transition: all .2s ease; z-index: 9999;
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
    bubble.addEventListener("click", (e) => e.stopPropagation());
    setTimeout(() => {
      bubble.querySelector(".custom-bubble")?.classList.add("show");
    }, 10);
    return bubble;
  };

  const showBubbleOverlay = useCallback(
    (store, storePosition, imageSrc) => {
      const key = `${store.latitude},${store.longitude}`;

      // 기존 둥근 마커 제거
      const prevRound = overlayMapRef.current.round[key];
      if (prevRound) {
        prevRound.setMap(null);
        prevRound.getContent()?.remove?.();
        delete overlayMapRef.current.round[key];
      }

      // 카드 안 가리게 살짝 남쪽으로 팬
      const offsetLat = 0.005;
      const adjustedLat = store.latitude - offsetLat;
      const adjustedCenter = new window.kakao.maps.LatLng(adjustedLat, store.longitude);
      mapInstance?.panTo(adjustedCenter);

      // 말풍선 생성
      const bubbleEl = createBubbleElement(store, imageSrc);
      const bubbleOverlay = new window.kakao.maps.CustomOverlay({
        position: storePosition,
        content: bubbleEl,
        yAnchor: 1.1,
        clickable: true,
        zIndex: 10000,
      });
      bubbleOverlay.setMap(mapInstance);

      overlayMapRef.current.bubble = bubbleOverlay;
      overlayMapRef.current.bubbleTargetKey = key;
      justOpenedAtRef.current = Date.now();
      setSelectedStore(store);
    },
    [mapInstance]
  );

  const renderMarkers = useCallback(
    (stores) => {
      if (!mapInstance || !stores) return;

      // 마커만 정리(말풍선은 유지)
      markersRef.current.forEach((m) => m.setMap?.(null));
      markersRef.current = [];
      Object.values(overlayMapRef.current.round).forEach((o) => o.setMap?.(null));
      overlayMapRef.current.round = {};

      const bounds = mapInstance.getBounds();

      stores.forEach((store) => {
        const key = `${store.latitude},${store.longitude}`;
        if (selectedCategory !== "all" && (store.type || "").toLowerCase() !== selectedCategory)
          return;

        const pos = new window.kakao.maps.LatLng(store.latitude, store.longitude);
        if (!bounds.contain(pos)) return;

        // 현재 말풍선 대상이면 마커 생성 스킵
        if (overlayMapRef.current.bubbleTargetKey === key) return;

        const imageSrc = (store.type || "").toLowerCase() === "market" ? marketIcon : martIcon;
        const markerEl = createMarkerElement(store, imageSrc);
        const roundOverlay = new window.kakao.maps.CustomOverlay({
          position: pos,
          content: markerEl,
          yAnchor: 1,
        });
        roundOverlay.setMap(mapInstance);
        overlayMapRef.current.round[key] = roundOverlay;

        markerEl.addEventListener("click", (e) => {
          e.stopPropagation();
          showBubbleOverlay(store, pos, imageSrc);
        });

        markersRef.current.push(roundOverlay);
      });
    },
    [mapInstance, selectedCategory, showBubbleOverlay]
  );

  // ---------- 초기 로딩 & 현재 위치 ----------
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

  // 주소 변경 시 센터 이동
  useEffect(() => {
    if (!mapInstance || !addressState.lat || !addressState.lng) return;
    const newCenter = new window.kakao.maps.LatLng(addressState.lat, addressState.lng);
    mapInstance.setCenter(newCenter);
  }, [mapInstance, addressState.lat, addressState.lng]);

  // 현재 위치 마커
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

  // ---------- 맵 idle → bbox 갱신 (스냅 + 디바운스 500ms, 동일 BBOX 스킵) ----------
  useEffect(() => {
    if (!mapInstance) return;

    const DEBOUNCE_MS = 500;
    let t = null;
    const snap = (v, step = 0.005) => Math.round(v / step) * step;

    const update = () => {
      const b = mapInstance.getBounds?.();
      if (!b) return;
      const sw = b.getSouthWest();
      const ne = b.getNorthEast();

      const next = {
        minX: snap(sw.getLng()),
        minY: snap(sw.getLat()),
        maxX: snap(ne.getLng()),
        maxY: snap(ne.getLat()),
      };

      // 동일 BBOX면 스킵
      setBbox((prev) => {
        if (
          prev &&
          prev.minX === next.minX &&
          prev.minY === next.minY &&
          prev.maxX === next.maxX &&
          prev.maxY === next.maxY
        ) {
          return prev;
        }
        return next;
      });
    };

    const onIdle = () => {
      clearTimeout(t);
      t = setTimeout(update, DEBOUNCE_MS);
    };

    window.kakao.maps.event.addListener(mapInstance, "idle", onIdle);
    onIdle(); // 초기 1회

    return () => {
      clearTimeout(t);
      window.kakao.maps.event.removeListener(mapInstance, "idle", onIdle);
    };
  }, [mapInstance]);

  // ---------- 리스트 모드 기본 bbox 보정 (맵 없어도 쿼리 가능하게) ----------
  useEffect(() => {
    if (isListMode && !bbox && addressState?.lat && addressState?.lng) {
      const span = 0.02; // 약 2km 박스
      setBbox({
        minX: addressState.lng - span,
        minY: addressState.lat - span,
        maxX: addressState.lng + span,
        maxY: addressState.lat + span,
      });
    }
  }, [isListMode, bbox, addressState?.lat, addressState?.lng]);

  // =========================================================
  // API 파라미터 변환
  // =========================================================
  const buildMarketParams = (bbox) => ({
    minX: bbox.minX,
    minY: bbox.minY,
    maxX: bbox.maxX,
    maxY: bbox.maxY,
    page: 1,
    size: 50, // markets는 50 유지
  });

  // 👉 marts: 스웨거 스타일(넓은 bbox + 소수 3자리 + size = 5)
  const buildMartParams = (bbox) => {
    const ensureMinSpan = (src, minLon = 0.3, minLat = 0.3) => {
      const cx = (src.minX + src.maxX) / 2;
      const cy = (src.minY + src.maxY) / 2;
      const halfX = Math.max((src.maxX - src.minX) / 2, minLon / 2);
      const halfY = Math.max((src.maxY - src.minY) / 2, minLat / 2);
      return { minX: cx - halfX, minY: cy - halfY, maxX: cx + halfX, maxY: cy + halfY };
    };
    const round3 = (n) => Math.round(n * 1e3) / 1e3;
    const bb = ensureMinSpan(bbox);
    return {
      minX: round3(bb.minX),
      minY: round3(bb.minY),
      maxX: round3(bb.maxX),
      maxY: round3(bb.maxY),
      page: 1,
      size: 5, // 기본값 5
    };
  };

  // ---------- 전통시장 ----------
  const { data: storesData = [], refetch } = useQuery({
    queryKey: ["markets", bbox?.minX, bbox?.minY, bbox?.maxX, bbox?.maxY],
    // ✅ 리스트 모드에서도 동작하도록 enabled 조건 수정
    enabled: !!bbox && (!!mapInstance || isListMode),
    retry: false,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 60 * 1000,
    queryFn: async () => {
      try {
        await testLoginIfNeeded();
      } catch (e) {
        console.warn("[auth] testLoginIfNeeded 실패(무시 가능)", e);
      }
      const params = buildMarketParams(bbox);
      const res = await APIService.private.get("/markets", { params });
      const raw = Array.isArray(res) ? res : res?.data ?? res?.content ?? res?.items ?? res ?? [];
      return Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : [];
    },
    select: (raw) =>
      raw
        .map((r) => {
          const mapped = mapMarketFromAPI(r);
          return mapped && { ...mapped, type: "market" };
        })
        .filter(Boolean),
  });

  // ---------- 대형마트 ----------
  const { data: martsData = [], refetch: refetchMarts } = useQuery({
    queryKey: ["marts", bbox?.minX, bbox?.minY, bbox?.maxX, bbox?.maxY],
    // ✅ 리스트 모드에서도 동작하도록 enabled 조건 수정
    enabled: !!bbox && (!!mapInstance || isListMode),
    retry: false,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 60 * 1000,
    queryFn: async () => {
      try {
        await testLoginIfNeeded();
      } catch (e) {
        console.warn("[auth] testLoginIfNeeded 실패(무시 가능)", e);
      }
      const params = buildMartParams(bbox);
      const res = await APIService.private.get("/marts", { params });
      const raw = Array.isArray(res) ? res : res?.data ?? res?.content ?? res?.items ?? res ?? [];
      return Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : [];
    },
    select: (raw) =>
      raw
        .map((r) => {
          const mapped = mapMarketFromAPI(r);
          return mapped && { ...mapped, type: "mart" };
        })
        .filter(Boolean),
  });

  // ---------- 데이터 머지 & 필터 ----------
  const mergedStoresData = useMemo(() => {
    const mapByKey = new Map();
    [...(storesData || []), ...(martsData || [])].forEach((s) => {
      const key = s?.id ?? `${s?.latitude},${s?.longitude},${s?.name}`;
      if (!mapByKey.has(key)) mapByKey.set(key, s);
    });
    return Array.from(mapByKey.values());
  }, [storesData, martsData]);

  const filteredStores = useMemo(() => {
    if (selectedCategory === "all") return mergedStoresData;
    return mergedStoresData.filter((s) => (s.type || "").toLowerCase() === selectedCategory);
  }, [mergedStoresData, selectedCategory]);

  // ---------- 마커 렌더 ----------
  useEffect(() => {
    if (!isListMode) {
      renderMarkers(filteredStores);
    }
  }, [filteredStores, renderMarkers, isListMode]);

  // ---------- 맵 클릭 시 버블 닫기 ----------
  useEffect(() => {
    if (!mapInstance) return;

    const handleMapClick = () => {
      if (Date.now() - justOpenedAtRef.current < 200) return;

      const { bubble, bubbleTargetKey } = overlayMapRef.current;
      if (!bubble || !bubbleTargetKey) return;

      bubble.setMap(null);
      bubble.getContent()?.remove?.();
      overlayMapRef.current.bubble = null;
      overlayMapRef.current.bubbleTargetKey = null;
      setSelectedStore(null);

      // 버블 대상 자리에 둥근 마커 복원
      const store = filteredStores.find((s) => `${s.latitude},${s.longitude}` === bubbleTargetKey);
      if (!store) return;
      const imageSrc = (store.type || "").toLowerCase() === "market" ? marketIcon : martIcon;
      const markerEl = createMarkerElement(store, imageSrc);
      const pos = new window.kakao.maps.LatLng(store.latitude, store.longitude);
      const roundOverlay = new window.kakao.maps.CustomOverlay({
        position: pos,
        content: markerEl,
        yAnchor: 1,
      });
      roundOverlay.setMap(mapInstance);
      overlayMapRef.current.round[bubbleTargetKey] = roundOverlay;
      markerEl.addEventListener("click", (e) => {
        e.stopPropagation();
        showBubbleOverlay(store, pos, imageSrc);
      });
    };

    window.kakao.maps.event.addListener(mapInstance, "click", handleMapClick);
    return () => {
      window.kakao.maps.event.removeListener(mapInstance, "click", handleMapClick);
    };
  }, [mapInstance, filteredStores, showBubbleOverlay]);

  // ---------- 리스트/지도 전환 시 ----------
  useEffect(() => {
    if (!isListMode && !mapInstance && addressState.lat && addressState.lng) {
      (async () => {
        await ensureKakaoReady();
        await waitForContainerSize();
        createMap();
      })();
    }
  }, [isListMode, mapInstance, addressState.lat, addressState.lng, createMap]);

  // ---------- 렌더 ----------
  return (
    <KakaoMapWrapper $isListMode={isListMode}>
      {isListMode ? (
        <>
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
          // ❌ setMapInstance(null) 제거: 리스트 모드에서도 캐시/쿼리 유지
          setIsListMode((prev) => !prev);
          // 굳이 없어도 되지만, 남겨도 무해함
          setTimeout(() => {
            refetch();
            refetchMarts();
          }, 0);
        }}
      >
        <StoreListIcon src={StoreListImg} alt="목록 아이콘" />
        <StoreListText>{isListMode ? "지도보기" : "목록보기"}</StoreListText>
      </StoreListButton>
    </KakaoMapWrapper>
  );
}
