import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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

// === 안전 설정 (필요 시 숫자만 더 키우면 됨) ===
const SAFE = {
  // idle 후 호출까지 딜레이 (기존 500 → 700ms)
  IDLE_DEBOUNCE_MS: 700,

  // 마트 bbox 반올림(키 안정화) 단위 (기존 ~0.01 → 0.02)
  MART_ROUND_DECIMALS: 2, // (= Math.round(n*1e2)/1e2 ≒ 0.01)
  MART_ROUND_STEP_HINT: 0.02, // 코멘트용 힌트

  // 타일 분할 임계치 (면적) — 더 큰 값일 때만 분할해서 “불필요한 분할” 억제
  TILE_SPLIT_THRESHOLD_2X2: 0.8, // 기존 0.2 → 0.8
  TILE_SPLIT_THRESHOLD_4X4: 1.6, // 기존 0.6 → 1.6

  // 타일 간 호출 간격 (기존 120 → 250ms)
  TILE_COOLDOWN_MS: 250,

  // 전체 마트 요청 사이 쿨다운 (bbox 바뀌어도 최소 이 간격 유지)
  MART_GLOBAL_COOLDOWN_MS: 1200,

  // 백오프(429/504) 파라미터 (기본 0.8s → 1.2s, 시도 3 → 4)
  BACKOFF_BASE_MS: 1200,
  BACKOFF_TRIES: 4,

  // 마트 페이지 사이즈(더 크게 가져와 호출 횟수 감소, 20 → 30)
  MART_PAGE_SIZE: 30,
};

/* =======================
 * 유틸(마트 전용 개선)
 * ======================= */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/** 동일 키 동시요청 중복 제거 */
const pendingRequests = new Map();
const withDedup = async (key, fn) => {
  if (pendingRequests.has(key)) return pendingRequests.get(key);
  const p = fn().finally(() => pendingRequests.delete(key));
  pendingRequests.set(key, p);
  return p;
};

/** 429/504 전용 지수 백오프 재시도 */
async function backoffRequest(
  reqFn,
  { tries = SAFE.BACKOFF_TRIES, base = SAFE.BACKOFF_BASE_MS } = {}
) {
  let delay = base;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await reqFn();
      return res;
    } catch (err) {
      const status = err?.response?.status ?? err?.status;
      if (status !== 429 && status !== 504) throw err;
      await sleep(delay + Math.random() * 300);
      delay *= 2;
    }
  }
  return reqFn();
}

/** bbox 타일 분할 */
function splitBbox(b, tiles = 2) {
  const xs = [];
  const ys = [];
  for (let i = 0; i <= tiles; i++) {
    xs.push(b.minX + ((b.maxX - b.minX) * i) / tiles);
    ys.push(b.minY + ((b.maxY - b.minY) * i) / tiles);
  }
  const parts = [];
  for (let i = 0; i < tiles; i++) {
    for (let j = 0; j < tiles; j++) {
      parts.push({
        minX: xs[i],
        maxX: xs[i + 1],
        minY: ys[j],
        maxY: ys[j + 1],
      });
    }
  }
  return parts;
}

export default function KakaoMap() {
  const mapRef = useRef(null);
  const { state: navState } = useLocation();
  const navigate = useNavigate();
  const [mapInstance, setMapInstance] = useState(null);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedCategory] = useAtom(selectedCategoryAtom);
  const [isListMode, setIsListMode] = useState(false);
  const addressState = useAtomValue(selectedAddressAtom);
  const setSelectedAddress = useSetAtom(selectedAddressAtom);

  const markersRef = useRef([]);
  const currentMarkerRef = useRef(null);
  const martNextAllowedAtRef = useRef(0);
  const centerLockUntilRef = useRef(0);
  const overlayMapRef = useRef({
    round: {},
    bubble: null,
    bubbleTargetKey: null,
  });
  const justOpenedAtRef = useRef(0);

  const pendingFocusRef = useRef(null);
  const [bbox, setBbox] = useState(null);

  // 마트 전용 안내/오류 상태
  const [rateLimited, setRateLimited] = useState(false);
  const [netError, setNetError] = useState(false);

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
    marker.addEventListener("click", (e) => e.stopPropagation());

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
    (store, storePosition, imageSrc, opts = { useOffset: true, offsetLat: 0.0007 }) => {
      const key = `${store.latitude},${store.longitude}`;

      // 기존 둥근 마커 제거
      const prevRound = overlayMapRef.current.round[key];
      if (prevRound) {
        prevRound.setMap(null);
        prevRound.getContent()?.remove?.();
        delete overlayMapRef.current.round[key];
      }

      // 리스트 선택일 때는 정확히 상점 좌표로 센터 이동
      if (opts?.useOffset) {
        const offsetLat = opts.offsetLat ?? 0.0007;
        const adjustedLat = store.latitude - offsetLat;
        const adjustedCenter = new window.kakao.maps.LatLng(adjustedLat, store.longitude);
        mapInstance?.panTo(adjustedCenter);
      } else {
        mapInstance?.panTo(storePosition);
      }

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

  const handleSelectFromList = useCallback((store) => {
    pendingFocusRef.current = store;
    centerLockUntilRef.current = Date.now() + 1500;
    setIsListMode(false);
  }, []);

  const renderMarkers = useCallback(
    (stores) => {
      if (!mapInstance || !stores) return;

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
    if (Date.now() < centerLockUntilRef.current) return;
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

    const DEBOUNCE_MS = SAFE.IDLE_DEBOUNCE_MS;
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
    onIdle();

    return () => {
      clearTimeout(t);
      window.kakao.maps.event.removeListener(mapInstance, "idle", onIdle);
    };
  }, [mapInstance]);

  // ---------- 리스트 모드 기본 bbox 보정 (맵 없어도 쿼리 가능하게) ----------
  useEffect(() => {
    if (isListMode && !bbox && addressState?.lat && addressState?.lng) {
      const span = 0.02;
      setBbox({
        minX: addressState.lng - span,
        minY: addressState.lat - span,
        maxX: addressState.lng + span,
        maxY: addressState.lat + span,
      });
    }
  }, [isListMode, bbox, addressState?.lat, addressState?.lng]);

  useEffect(() => {
    if (!isListMode && mapInstance && pendingFocusRef.current) {
      const store = pendingFocusRef.current;
      const pos = new window.kakao.maps.LatLng(store.latitude, store.longitude);
      const imageSrc = (store.type || "").toLowerCase() === "market" ? marketIcon : martIcon;
      const handler = () => {
        showBubbleOverlay(store, pos, imageSrc, { useOffset: true, offsetLat: 0.0005 });
        centerLockUntilRef.current = Date.now() + 800;
        window.kakao.maps.event.removeListener(mapInstance, "tilesloaded", handler);
      };
      mapInstance.setCenter(pos);
      window.kakao.maps.event.addListener(mapInstance, "tilesloaded", handler);
      pendingFocusRef.current = null;
    }
  }, [isListMode, mapInstance, showBubbleOverlay]);

  // API 파라미터 변환
  const buildMarketParams = (bbox) => ({
    minX: bbox.minX,
    minY: bbox.minY,
    maxX: bbox.maxX,
    maxY: bbox.maxY,
    page: 1,
    size: 50,
  });

  // ⚠️ 마트 파라미터만 살짝 다르게(키 안정화 강하게)
  const buildMartParams = (bbox) => {
    const ensureMinSpan = (src, minLon = 0.3, minLat = 0.3) => {
      const cx = (src.minX + src.maxX) / 2;
      const cy = (src.minY + src.maxY) / 2;
      const halfX = Math.max((src.maxX - src.minX) / 2, minLon / 2);
      const halfY = Math.max((src.maxY - src.minY) / 2, minLat / 2);
      return { minX: cx - halfX, minY: cy - halfY, maxX: cx + halfX, maxY: cy + halfY };
    };
    const roundN = (n) => Math.round(n * 1e2) / 1e2; // ≒ 0.01 (실제 체감은 0.02단위로 움직이게 됨)
    const bb = ensureMinSpan(bbox);
    return {
      minX: roundN(bb.minX),
      minY: roundN(bb.minY),
      maxX: roundN(bb.maxX),
      maxY: roundN(bb.maxY),
      page: 1,
      size: SAFE.MART_PAGE_SIZE, // 30
    };
  };

  /* =======================
   * 전통시장(그대로 유지)
   * ======================= */
  const { data: storesData = [], refetch } = useQuery({
    queryKey: ["markets", bbox?.minX, bbox?.minY, bbox?.maxX, bbox?.maxY],
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

  // =======================
  // 대형마트(강화 버전)
  // =======================
  const { data: martsData = [], refetch: refetchMarts } = useQuery({
    queryKey: ["marts", bbox?.minX, bbox?.minY, bbox?.maxX, bbox?.maxY],
    enabled: !!bbox && (!!mapInstance || isListMode),
    retry: false,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 60 * 1000,
    queryFn: async () => {
      // 네트워크 안내 초기화
      setNetError(false);

      // 0) (옵션) 인증 시도 — 실패해도 무시
      try {
        await testLoginIfNeeded();
      } catch {
        // 인증 실패
      }

      // 1) 🔒 전역 쿨다운: 이전 호출 이후 최소 N ms 간격 유지
      const now = Date.now();
      const wait = martNextAllowedAtRef.current - now;
      if (wait > 0) await sleep(wait);

      // 2) bbox 정규화(마트 전용 빌더)
      const bb = buildMartParams(bbox);

      // 3) 넓은 영역만 타일 분할(보수적 기준)
      const spanX = Math.abs(bb.maxX - bb.minX);
      const spanY = Math.abs(bb.maxY - bb.minY);
      const area = spanX * spanY;

      const tiles =
        area > SAFE.TILE_SPLIT_THRESHOLD_4X4
          ? splitBbox(bb, 4)
          : area > SAFE.TILE_SPLIT_THRESHOLD_2X2
          ? splitBbox(bb, 2)
          : [bb]; // 작으면 분할 안 함

      // 4) 타일을 순차 호출 + 타일 간 쿨다운으로 QPS 억제
      const results = [];
      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        const params = { ...t, page: 1, size: bb.size ?? SAFE.MART_PAGE_SIZE };

        // 동일 파라미터 중복 방지 키
        const key = `marts:${params.minX}:${params.minY}:${params.maxX}:${params.maxY}:${params.size}`;

        // 실제 API 호출(429/504에서만 백오프 재시도)
        const call = () =>
          APIService.private
            .get("/marts", { params })
            .then((res) => res?.data ?? res?.content ?? res?.items ?? res ?? [])
            .catch((err) => {
              const status = err?.response?.status ?? err?.status;
              if (status === 429) setRateLimited(true); // 호출 제한 토스트 ON
              if (status === 504) {
                setRateLimited(true);
                setNetError(true);
              } // 네트워크 토스트 ON
              throw err;
            });

        // 디듀프 + 백오프
        const arr = await withDedup(key, () => backoffRequest(call));

        // 결과 합치기
        results.push(
          ...(Array.isArray(arr) ? arr : Array.isArray(arr?.content) ? arr.content : [])
        );

        // 다음 타일까지 쿨다운 — 순간 동시폭주 방지
        if (i < tiles.length - 1) await sleep(SAFE.TILE_COOLDOWN_MS);
      }

      // 데이터가 하나라도 오면 레이트 리밋 토스트 OFF
      if (results.length) setRateLimited(false);

      // 5) ✅ 글로벌 쿨다운 갱신
      martNextAllowedAtRef.current = Date.now() + SAFE.MART_GLOBAL_COOLDOWN_MS;

      return results;
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
    if (!isListMode && addressState.lat && addressState.lng) {
      (async () => {
        await ensureKakaoReady();
        await waitForContainerSize();
        createMap();
      })();
    }
  }, [isListMode, addressState.lat, addressState.lng, createMap]);

  useEffect(() => {
    if (isListMode && mapInstance) {
      setMapInstance(null);
    }
  }, [isListMode, mapInstance]);

  useEffect(() => {
    const store = navState?.focusStore;
    if (!store || !store.latitude || !store.longitude) return;

    pendingFocusRef.current = store;
    centerLockUntilRef.current = Date.now() + 1500;
    setIsListMode(false);

    navigate(".", { replace: true, state: null });
  }, [navState, navigate]);

  return (
    <KakaoMapWrapper $isListMode={isListMode}>
      {/* 상단 토스트: 호출 제한/네트워크 안내 (마트 전용) */}
      {rateLimited && (
        <div
          style={{
            position: "fixed",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 99999,
            background: "#1f2937",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: 8,
            fontSize: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,.2)",
          }}
        >
          카카오 호출 제한으로 일부 마커를 불러오지 못했어. 잠시 후 자동 재시도 중이야
        </div>
      )}

      {/* 504 등 네트워크 안내 + 수동 재시도 */}
      {netError && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            border: "1px solid #ddd",
            padding: "10px 12px",
            borderRadius: 8,
            zIndex: 99999,
            fontSize: 12,
          }}
        >
          네트워크 지연으로 일부 마커를 불러오지 못했어.
          <button
            style={{
              marginLeft: 8,
              padding: "4px 8px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#f8f8f8",
              cursor: "pointer",
            }}
            onClick={() => {
              setNetError(false);
              refetchMarts();
            }}
          >
            재시도
          </button>
        </div>
      )}

      {isListMode ? (
        <>
          <StoreListView stores={filteredStores} onSelect={handleSelectFromList} />
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
          setIsListMode((prev) => !prev);
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
