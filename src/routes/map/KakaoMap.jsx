// src/routes/map/index.jsx
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

// ============== 안전 상수 (보수화) ==============
const SAFE = {
  IDLE_DEBOUNCE_MS: 700,
  MAP_MIN_LEVEL: 3,
  MAP_MAX_LEVEL: 7,

  BBOX_AREA_MAX: 0.05, // 프론트 전체 가드

  // 요청 수 줄이기 위해 분할 임계/쿨다운 강화
  TILE_SPLIT_THRESHOLD_2X2: 1.0, // 1.4 -> 1.0
  TILE_SPLIT_THRESHOLD_4X4: 1.8, // 2.6 -> 1.8
  TILE_COOLDOWN_MS: 450, // 300 -> 450

  MART_GLOBAL_COOLDOWN_MS: 12000, // 7000 -> 12000
  BACKOFF_BASE_MS: 1200,
  BACKOFF_TRIES: 4,

  // ✅ 백엔드 페이징 검증 보수적으로 맞춤
  MART_PAGE_SIZE: 15,
  MARKET_PAGE_SIZE: 50,

  // 마트 박스 한도(가로*세로)
  MART_BBOX_AREA_MAX: 0.015, // 0.02 -> 0.015

  // ✅ 마트 최소 가로/세로(경위도) 0.03 강제
  MART_MIN_SPAN: 0.03, // 0.02 -> 0.03
};

// ====== 서킷 브레이커(폭주 차단) ======
const circuitRef = { openUntil: 0, strikes: 0, lastStrikeAt: 0 };
const CIRCUIT = {
  STRIKE_WINDOW_MS: 20000,
  OPEN_AFTER_STRIKES: 3,
  OPEN_MS: 60000,
};
function circuitRecord(status) {
  const now = Date.now();
  if (status === 429 || status === 500 || status === 504) {
    if (now - circuitRef.lastStrikeAt > CIRCUIT.STRIKE_WINDOW_MS) {
      circuitRef.strikes = 0;
    }
    circuitRef.lastStrikeAt = now;
    circuitRef.strikes += 1;
    if (circuitRef.strikes >= CIRCUIT.OPEN_AFTER_STRIKES) {
      circuitRef.openUntil = now + CIRCUIT.OPEN_MS;
      circuitRef.strikes = 0;
    }
  } else {
    circuitRef.strikes = 0;
  }
}
function circuitOpen() {
  return Date.now() < circuitRef.openUntil;
}

// ====== 클라이언트 타일 LRU 캐시 ======
const martTileCache = new Map(); // key -> { data, until }
const MART_TILE_TTL_MS = 5 * 60_000;
function cacheKeyFromParams(p) {
  return `${p.minX},${p.minY},${p.maxX},${p.maxY},${p.size}`;
}
function cacheGet(key) {
  const v = martTileCache.get(key);
  if (!v) return null;
  if (Date.now() > v.until) {
    martTileCache.delete(key);
    return null;
  }
  return v.data;
}
function cacheSet(key, data) {
  martTileCache.set(key, { data, until: Date.now() + MART_TILE_TTL_MS });
}

// ============== 유틸 ==============
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const n5 = (v) => Math.round(Number(v) * 1e5) / 1e5;
const clamp = (v, lo, hi) => Math.min(Math.max(Number(v), lo), hi);

// Retry-After 헤더 파싱
function parseRetryAfter(err) {
  const h = err?.response?.headers ?? {};
  const ra = h["retry-after"] ?? h["Retry-After"] ?? err?.response?.data?.retryAfter;
  if (!ra) return null;
  const secs = Number(String(ra).match(/\d+/)?.[0]);
  return Number.isFinite(secs) ? secs * 1000 : null;
}

// 박스 정규화 + 최소 스팬 보정 + 한반도 대략 클램프 + 소수 5자리 스냅
function normalizeBbox(bb, minSpan = SAFE.MART_MIN_SPAN) {
  let minX = Math.min(bb.minX, bb.maxX);
  let maxX = Math.max(bb.minX, bb.maxX);
  let minY = Math.min(bb.minY, bb.maxY);
  let maxY = Math.max(bb.minY, bb.maxY);

  if (maxX - minX < minSpan) {
    const mid = (minX + maxX) / 2;
    minX = mid - minSpan / 2;
    maxX = mid + minSpan / 2;
  }
  if (maxY - minY < minSpan) {
    const mid = (minY + maxY) / 2;
    minY = mid - minSpan / 2;
    maxY = mid + minSpan / 2;
  }

  // 한국 대략 영역 클램프(경도 124~132, 위도 33~39)
  minX = clamp(minX, 124, 132);
  maxX = clamp(maxX, 124, 132);
  minY = clamp(minY, 33, 39);
  maxY = clamp(maxY, 33, 39);

  return { minX: n5(minX), minY: n5(minY), maxX: n5(maxX), maxY: n5(maxY) };
}

function validateMartParams(p) {
  if (!(p.minX < p.maxX) || !(p.minY < p.maxY)) return false;
  const area = Math.abs(p.maxX - p.minX) * Math.abs(p.maxY - p.minY);
  if (area <= 0 || area > SAFE.MART_BBOX_AREA_MAX) return false;
  return true;
}

/** 디듀프: 동일 키 동시요청을 하나로 합치기 */
const pendingRequests = new Map();
function withDedup(key, fn) {
  if (pendingRequests.has(key)) return pendingRequests.get(key);
  const p = Promise.resolve()
    .then(fn)
    .finally(() => pendingRequests.delete(key));
  pendingRequests.set(key, p);
  return p;
}

/** 429/504에서만 지수 백오프(+ Retry-After 존중) */
async function backoffRequest(
  reqFn,
  { tries = SAFE.BACKOFF_TRIES, base = SAFE.BACKOFF_BASE_MS } = {}
) {
  let delay = base;
  for (let i = 0; i < tries; i++) {
    try {
      return await reqFn();
    } catch (err) {
      const status = err?.response?.status ?? err?.status;
      if (status !== 429 && status !== 504) throw err;

      const ra = parseRetryAfter(err);
      const wait = ra ?? delay + Math.random() * 300;
      await sleep(wait);
      delay *= 2;
    }
  }
  return reqFn();
}

/** BBOX N×N 분할 */
function splitBbox(b, tiles = 2) {
  const xs = [],
    ys = [];
  for (let i = 0; i <= tiles; i++) {
    xs.push(b.minX + ((b.maxX - b.minX) * i) / tiles);
    ys.push(b.minY + ((b.maxY - b.minY) * i) / tiles);
  }
  const parts = [];
  for (let i = 0; i < tiles; i++) {
    for (let j = 0; j < tiles; j++) {
      parts.push({ minX: xs[i], maxX: xs[i + 1], minY: ys[j], maxY: ys[j + 1] });
    }
  }
  return parts;
}

const bboxArea = (b) => Math.abs(b.maxX - b.minX) * Math.abs(b.maxY - b.minY);
const split2x2 = (b) => splitBbox(b, 2).map((t) => normalizeBbox(t, SAFE.MART_MIN_SPAN));

// 타일 에러 캐시(짧은 TTL 블랙리스트)
const tileErrorCache = new Map(); // key -> { until: ts, count: n }
const tileKeyFromParams = (p) => [p.minX, p.minY, p.maxX, p.maxY].join(",");
function isTileBlacklisted(p) {
  const k = tileKeyFromParams(p);
  const rec = tileErrorCache.get(k);
  if (!rec) return false;
  if (Date.now() > rec.until) {
    tileErrorCache.delete(k);
    return false;
  }
  return true;
}
function markTileError(p, { ttlMs = 90_000 } = {}) {
  const k = tileKeyFromParams(p);
  const prev = tileErrorCache.get(k) || { until: 0, count: 0 };
  tileErrorCache.set(k, { until: Date.now() + ttlMs, count: prev.count + 1 });
}

// 400인데 사실상 일시적 서버오류일 때 식별
function isTransient400(err) {
  const s = err?.response?.status;
  if (s !== 400) return false;
  const d = err?.response?.data;
  const msg = (d?.message || d?.error || "").toString().toLowerCase();
  return msg.includes("retries exhausted") || msg.includes("temporary") || msg.includes("timeout");
}

/**
 * 단일 타일 호출 (캐시+디듀프+백오프):
 * - 캐시 히트 시 즉시 반환
 * - 429/504: backoffRequest
 * - 400(transient): 500처럼 더 잘게 쪼개 재시도
 * - 400(param invalid): 로그만 남기고 빈 배열
 * - 500: 최대 depth 2까지 2x2 재귀 재시도, 실패 시 블랙리스트 등록
 */
async function fetchMartTile(params, controller, depth = 0) {
  const norm = normalizeBbox(params, SAFE.MART_MIN_SPAN);
  if (isTileBlacklisted(norm)) return [];

  const key = cacheKeyFromParams({ ...norm, size: params.size });
  const hit = cacheGet(key);
  if (hit) return hit;

  const call = async () => {
    const res = await APIService.private.get("/marts", {
      params: { ...norm, page: 1, size: params.size },
      signal: controller.signal,
    });
    return res?.data ?? res?.content ?? res?.items ?? res ?? [];
  };

  const dedupKey = `marts:${key}`;

  try {
    const data = await withDedup(dedupKey, () => backoffRequest(call));
    const arr = Array.isArray(data) ? data : data?.content ?? [];
    cacheSet(key, arr);
    return arr;
  } catch (e) {
    const s = e?.response?.status;
    circuitRecord(s || 500);

    // 일시적 400 → 500처럼 재시도
    if (isTransient400(e)) {
      if (depth < 2) {
        const tinyTiles = split2x2(norm);
        const merged = [];
        for (const tt of tinyTiles) {
          if (bboxArea(tt) <= 0) continue;
          const part = await fetchMartTile(
            { ...tt, page: 1, size: params.size },
            controller,
            depth + 1
          );
          if (Array.isArray(part)) merged.push(...part);
        }
        if (merged.length === 0) markTileError(norm, { ttlMs: 60_000 });
        cacheSet(key, merged);
        return merged;
      }
      markTileError(norm, { ttlMs: 60_000 });
      return [];
    }

    // 진짜 파라미터 400
    if (s === 400) {
      console.groupCollapsed("%c[/marts 400] params", "color:#d97706;font-weight:700");
      console.log(norm);
      console.log("resp:", {
        data: e?.response?.data,
        headers: e?.response?.headers,
        requestId:
          e?.response?.headers?.["x-request-id"] ||
          e?.response?.headers?.["x-amzn-requestid"] ||
          e?.response?.headers?.["x-amz-request-id"],
      });
      console.groupEnd();
      return [];
    }

    // 500: 재귀 분할
    if (s === 500 && depth < 2) {
      const tinyTiles = split2x2(norm);
      const merged = [];
      for (const tt of tinyTiles) {
        if (bboxArea(tt) <= 0) continue;
        const part = await fetchMartTile(
          { ...tt, page: 1, size: params.size },
          controller,
          depth + 1
        );
        if (Array.isArray(part)) merged.push(...part);
      }
      if (merged.length === 0) markTileError(norm);
      cacheSet(key, merged);
      return merged;
    }

    if (s === 500) {
      markTileError(norm);
      return [];
    }

    throw e;
  }
}

/** 여러 타일을 순차 호출해서 합치기 */
async function fetchMartTilesSequential(tiles, size, controller) {
  const results = [];
  for (const t of tiles) {
    const tNorm = normalizeBbox(t, SAFE.MART_MIN_SPAN);
    if (isTileBlacklisted(tNorm)) continue;

    const params = { ...tNorm, page: 1, size };
    const arr = await fetchMartTile(params, controller, 0);
    if (Array.isArray(arr)) results.push(...arr);
    await sleep(SAFE.TILE_COOLDOWN_MS);
  }
  return results;
}

// ====== 적응형 게이팅(줌/이동량/쿨다운) ======
const lastQueryRef = { center: null, level: null, at: 0 };
function shouldQuery(map) {
  if (!map?.getLevel || !map?.getCenter) return false;
  const level = map.getLevel();
  // 충분히 확대됐을 때만 허용
  if (level > 5) return false;

  const center = map.getCenter();
  const now = Date.now();
  const last = lastQueryRef;

  const moved =
    !last.center ||
    Math.abs(center.getLat() - last.center.getLat?.()) > 0.004 ||
    Math.abs(center.getLng() - last.center.getLng?.()) > 0.004;

  const leveled = last.level == null || Math.abs(level - last.level) >= 1;
  const cooled = now - (last.at || 0) > 10_000; // 최소 10초

  if ((moved || leveled) && cooled) {
    lastQueryRef.center = center;
    lastQueryRef.level = level;
    lastQueryRef.at = now;
    return true;
  }
  return false;
}

// ====== 컴포넌트 ======
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

  // 마트 과호출 제어
  const martNextAllowedAtRef = useRef(0);
  const lastMartKeyRef = useRef("");
  const martAbortRef = useRef(null);

  const centerLockUntilRef = useRef(0);
  const overlayMapRef = useRef({ round: {}, bubble: null, bubbleTargetKey: null });
  const justOpenedAtRef = useRef(0);
  const pendingFocusRef = useRef(null);

  const [bbox, setBbox] = useState(null);

  // 안내 상태
  const [rateLimited, setRateLimited] = useState(false);
  const [netError, setNetError] = useState(false);
  const [tooWide, setTooWide] = useState(false);

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
      minLevel: SAFE.MAP_MIN_LEVEL,
      maxLevel: SAFE.MAP_MAX_LEVEL,
      draggable: true,
      scrollwheel: true,
    });

    // 줌 변경 시 강제 가드
    window.kakao.maps.event.addListener(map, "zoom_changed", function () {
      const lvl = map.getLevel();
      if (lvl > SAFE.MAP_MAX_LEVEL) map.setLevel(SAFE.MAP_MAX_LEVEL);
      if (lvl < SAFE.MAP_MIN_LEVEL) map.setLevel(SAFE.MAP_MIN_LEVEL);
    });

    setMapInstance(map);
    setTimeout(() => window.kakao.maps.event.trigger(map, "resize"), 100);
  }, [addressState.lat, addressState.lng]);

  // ---------- 마커/버블 ----------
  const createMarkerElement = (store, imageSrc) => {
    const marker = document.createElement("div");
    marker.style.cssText =
      "width:50px;height:50px;background:#fff;border-radius:50%;display:flex;justify-content:center;align-items:center;box-shadow:1px 1px 4px 0 #E1E1E3;cursor:pointer;transform:scale(.8);opacity:0;transition:opacity .3s,transform .3s;";
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
        .custom-bubble{position:relative;display:flex;gap:6px;align-items:center;padding:8px 21px;border-radius:20px;background:#58D748;color:#fff;box-shadow:1px 1px 4px rgba(0,0,0,.1);transform:translateY(6px);opacity:0;transition:all .2s ease;z-index:9999;}
        .custom-bubble.show{opacity:1;transform:translateY(0);}
      </style>
      <div class="custom-bubble">
        <img src="${imageSrc}" style="width:20px;height:20px;margin-left:2px;" />
        <span>${store.name}</span>
        <div style="position:absolute;bottom:-6px;left:26px;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid #58D748;"></div>
      </div>`;
    bubble.addEventListener("click", (e) => e.stopPropagation());
    setTimeout(() => bubble.querySelector(".custom-bubble")?.classList.add("show"), 10);
    return bubble;
  };

  const showBubbleOverlay = useCallback(
    (store, storePosition, imageSrc, opts = { useOffset: true, offsetLat: 0.0007 }) => {
      const key = `${store.latitude},${store.longitude}`;
      const prevRound = overlayMapRef.current.round[key];
      if (prevRound) {
        prevRound.setMap(null);
        prevRound.getContent()?.remove?.();
        delete overlayMapRef.current.round[key];
      }

      if (opts?.useOffset) {
        const offsetLat = opts.offsetLat ?? 0.0007;
        const adjustedLat = store.latitude - offsetLat;
        const adjustedCenter = new window.kakao.maps.LatLng(adjustedLat, store.longitude);
        mapInstance?.panTo(adjustedCenter);
      } else {
        mapInstance?.panTo(storePosition);
      }

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

  // ---------- 초기 로딩 ----------
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
        const position = new window.kakao.maps.LatLng(coords.latitude, coords.longitude);
        if (!currentMarkerRef.current) {
          const markerImage = new window.kakao.maps.MarkerImage(
            currentMarkerIcon,
            new window.kakao.maps.Size(40, 40),
            { offset: new window.kakao.maps.Point(20, 40) }
          );
          const marker = new window.kakao.maps.Marker({ position, image: markerImage, zIndex: 10 });
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

  // ---------- idle → BBOX 갱신(디바운스) ----------
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

      // 면적 과대 시 프론트 차단
      const area = Math.abs(next.maxX - next.minX) * Math.abs(next.maxY - next.minY);
      setTooWide(area > SAFE.BBOX_AREA_MAX);

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

  // 리스트 모드 기본 bbox
  useEffect(() => {
    if (isListMode && !bbox && addressState?.lat && addressState?.lng) {
      const span = 0.03; // 마트 최소 스팬과 동일하게
      setBbox({
        minX: addressState.lng - span,
        minY: addressState.lat - span,
        maxX: addressState.lng + span,
        maxY: addressState.lat + span,
      });
    }
  }, [isListMode, bbox, addressState?.lat, addressState?.lng]);

  // 포커스 이동
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
      window.kakao.maps.event.addEventListener?.(mapInstance, "tilesloaded", handler);
      window.kakao.maps.event.addListener(mapInstance, "tilesloaded", handler);
      pendingFocusRef.current = null;
    }
  }, [isListMode, mapInstance, showBubbleOverlay]);

  // 파라미터 빌더
  const buildMarketParams = (bb) => ({
    minX: bb.minX,
    minY: bb.minY,
    maxX: bb.maxX,
    maxY: bb.maxY,
    page: 1,
    size: SAFE.MARKET_PAGE_SIZE,
  });

  const buildMartParams = (bb) => {
    const norm = normalizeBbox(bb, SAFE.MART_MIN_SPAN);
    return { ...norm, page: 1, size: SAFE.MART_PAGE_SIZE };
  };

  // ================= 전통시장 =================
  const { data: storesData = [], refetch } = useQuery({
    queryKey: ["markets", bbox?.minX, bbox?.minY, bbox?.maxX, bbox?.maxY],
    enabled: !!bbox && (!!mapInstance || isListMode) && !tooWide,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false, // Dev 중복 호출 방지
    keepPreviousData: true,
    staleTime: 60 * 1000,
    queryFn: async () => {
      try {
        await testLoginIfNeeded();
      } catch {
        //err
      }
      const params = buildMarketParams(bbox);
      const res = await APIService.private.get("/markets", { params });
      const raw = Array.isArray(res) ? res : res?.data ?? res?.content ?? res?.items ?? res ?? [];
      return Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : [];
    },
    select: (raw) =>
      raw
        .map((r) => {
          const m = mapMarketFromAPI(r);
          return m && { ...m, type: "market" };
        })
        .filter(Boolean),
  });

  // ================= 대형마트 =================
  const { data: martsData = [], refetch: refetchMarts } = useQuery({
    queryKey: ["marts", bbox?.minX, bbox?.minY, bbox?.maxX, bbox?.maxY],
    enabled: !!bbox && (!!mapInstance || isListMode) && !tooWide,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false, // Dev 중복 호출 방지
    keepPreviousData: true,
    staleTime: 60 * 1000,
    queryFn: async () => {
      // 서킷 오픈 시 완전 차단
      if (circuitOpen()) {
        return [];
      }

      // 줌/이동 게이팅
      if (!isListMode && !shouldQuery(mapInstance)) {
        return [];
      }

      // 마켓이 먼저 나가도록 살짝 스태거
      await sleep(200);
      setNetError(false);

      // 🔒 전역 쿨다운
      const now = Date.now();
      const wait = martNextAllowedAtRef.current - now;
      if (wait > 0) await sleep(wait);
      martNextAllowedAtRef.current = Date.now() + SAFE.MART_GLOBAL_COOLDOWN_MS;

      try {
        await testLoginIfNeeded();
      } catch {
        //err
      }

      const p = buildMartParams(bbox);

      // ✅ 최종 유효성 검사(면적/순서)
      if (!validateMartParams(p)) {
        // 잘못된 파라미터는 호출 자체 생략
        return [];
      }

      const key = [p.minX, p.minY, p.maxX, p.maxY, p.page, p.size].join("|");

      // ✅ 동일 bbox + 쿨다운 중이면 return
      if (key === lastMartKeyRef.current && Date.now() < martNextAllowedAtRef.current) {
        return [];
      }
      lastMartKeyRef.current = key;

      // 이전 요청 취소
      if (martAbortRef.current) {
        try {
          martAbortRef.current.abort();
        } catch {
          //err
        }
      }
      const controller = new AbortController();
      martAbortRef.current = controller;

      const area = Math.abs(p.maxX - p.minX) * Math.abs(p.maxY - p.minY);
      const tiles =
        area > SAFE.TILE_SPLIT_THRESHOLD_4X4
          ? splitBbox(p, 4)
          : area > SAFE.TILE_SPLIT_THRESHOLD_2X2
          ? splitBbox(p, 2)
          : [p];

      try {
        const results = await fetchMartTilesSequential(tiles, p.size, controller);
        if (results.length) setRateLimited(false);
        return results;
      } catch (err) {
        const status = err?.response?.status ?? err?.status;
        circuitRecord(status || 500);

        if (status === 429) {
          setRateLimited(true);
          const raMs = parseRetryAfter(err);
          const extra = raMs ?? SAFE.MART_GLOBAL_COOLDOWN_MS * 2;
          martNextAllowedAtRef.current = Math.max(martNextAllowedAtRef.current, Date.now() + extra);
        } else {
          setNetError(true);
        }
        return [];
      }
    },
    select: (raw) =>
      raw
        .map((r) => {
          const m = mapMarketFromAPI(r);
          return m && { ...m, type: "mart" };
        })
        .filter(Boolean),
  });

  // ---------- 데이터 머지/필터 ----------
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
    if (!isListMode) renderMarkers(filteredStores);
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
    return () => window.kakao.maps.event.removeListener(mapInstance, "click", handleMapClick);
  }, [mapInstance, filteredStores, showBubbleOverlay]);

  // ---------- 리스트/지도 전환 ----------
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
    if (isListMode && mapInstance) setMapInstance(null);
  }, [isListMode, mapInstance]);

  useEffect(() => {
    const store = navState?.focusStore;
    if (!store || !store.latitude || !store.longitude) return;
    pendingFocusRef.current = store;
    centerLockUntilRef.current = Date.now() + 1500;
    setIsListMode(false);
    navigate(".", { replace: true, state: null });
  }, [navState, navigate]);

  // ---------- UI ----------
  return (
    <KakaoMapWrapper $isListMode={isListMode}>
      {/* 과대 영역 경고 */}
      {tooWide && (
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
          }}
        >
          검색 범위가 너무 넓어. 지도를 조금 더 확대해줘
        </div>
      )}

      {/* 레이트리밋 안내 */}
      {rateLimited && (
        <div
          style={{
            position: "fixed",
            top: tooWide ? 44 : 12,
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
          호출 제한으로 일부 마커를 불러오지 못했어. 잠시 후 자동 재시도 중이야
        </div>
      )}

      {/* 네트워크 안내 + 수동 재시도 */}
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
          네트워크/요청 형식 문제로 일부 마커를 불러오지 못했어.
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
        <StoreListView stores={filteredStores} onSelect={handleSelectFromList} />
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
