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
  MAP_MAX_LEVEL: 7,
  BBOX_AREA_MAX: 0.05,
  MARKET_PAGE_SIZE: 50,
};

// ====== 기본 위치 상수 ======
const DEFAULT_LOCATION = {
  lat: 37.5013, // 서울 서초구 강남대로 27 (강남역 근처)
  lng: 127.0254,
  name: "서울 서초구 강남대로 27",
};

/**
 * 대형마트/슈퍼마켓 조회 (새로운 API)
 */
async function fetchMarts(params, controller) {
  try {
    const res = await APIService.private.get("/places", {
      params: {
        bounds: `${params.minX},${params.minY},${params.maxX},${params.maxY}`,
        center: `${(params.minX + params.maxX) / 2},${(params.minY + params.maxY) / 2}`,
        limit: params.size || 300,
      },
      signal: controller.signal,
    });
    return res?.data ?? [];
  } catch (e) {
    console.warn("[fetchMarts] API 호출 실패:", e);
    return [];
  }
}

// ====== 현위치 유틸(리팩터링 핵심) ======
const LAST_GEO_LS_KEY = "pickl:lastGeo";

// 간단한 GPS 위치 검증만 필요

// === GPS 위치 검증 (기본적인 유효성만 체크) ===
function isUsableCoords(coords) {
  const lat = Number(coords?.latitude);
  const lng = Number(coords?.longitude);
  const acc = Number(coords?.accuracy ?? 99999);

  // 기본적인 유효성만 체크
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    console.log("[usable] Invalid coordinates");
    return false;
  }

  // 정확도가 너무 낮으면 거부 (200km 이상)
  if (acc > 200000) {
    console.log("[usable] Accuracy too low:", acc);
    return false;
  }

  console.log("[usable] Coordinates accepted:", { lat, lng, acc });
  return true;
}

function readLastGeo(maxAgeMs = 3 * 24 * 60 * 60 * 1000) {
  try {
    const raw = localStorage.getItem(LAST_GEO_LS_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    const { lat, lng, at } = obj || {};
    if (typeof lat !== "number" || typeof lng !== "number") return null;
    if (typeof at === "number" && Date.now() - at > maxAgeMs) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

function writeLastGeo(lat, lng) {
  try {
    // 모든 유효한 좌표 저장
    localStorage.setItem(LAST_GEO_LS_KEY, JSON.stringify({ lat, lng, at: Date.now() }));
  } catch (e) {
    void e;
  }
}

// === 변경 ②: 최근 30초 캐시 허용으로 튐 완화 ===
function getPositionOnce({ timeout = 10000 } = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("geolocation unsupported"));

    if (navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((p) => {
          console.log("[geo] permission state:", p.state);
        })
        .catch(() => {});
    }

    let done = false;
    const tid = setTimeout(() => {
      if (done) return;
      done = true;
      reject(new Error("geo timeout"));
    }, timeout);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (done) return;
        done = true;
        clearTimeout(tid);
        const { latitude, longitude, accuracy } = pos.coords || {};
        console.log("[geo] success:", { latitude, longitude, accuracy });
        resolve(pos);
      },
      (err) => {
        if (done) return;
        done = true;
        clearTimeout(tid);
        console.warn("[geo] error:", { code: err?.code, message: err?.message });
        reject(err);
      },
      {
        enableHighAccuracy: false, // 정확도보다 안정성 우선
        maximumAge: 60000, // 1분 이내의 최근 측위 재사용
        timeout,
      }
    );
  });
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

  const centerLockUntilRef = useRef(0);
  const overlayMapRef = useRef({ round: {}, bubble: null, bubbleTargetKey: null });
  const justOpenedAtRef = useRef(0);
  const pendingFocusRef = useRef(null);
  const [bbox, setBbox] = useState(null);

  // 안내 상태
  const [netError, setNetError] = useState(false);
  const [tooWide, setTooWide] = useState(false);
  const [, setCurrentLevel] = useState(null); // 디버그/판정용(필수는 아님)

  // 대형마트 의무휴업일 알림 상태
  const [showMartNotice, setShowMartNotice] = useState(false);

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

  // ---------- 맵 생성 (초기 중심 좌표를 인자로 받도록 변경: 핵심) ----------
  const createMap = useCallback((centerLat, centerLng) => {
    if (!mapRef.current || !mapRef.current.isConnected) {
      console.warn("[map] Container not ready");
      return;
    }

    if (!window.kakao?.maps) {
      console.warn("[map] Kakao maps not ready");
      return;
    }

    console.log("[map] Creating map at:", centerLat, centerLng);
    const centerLatLng = new window.kakao.maps.LatLng(centerLat, centerLng);

    const map = new window.kakao.maps.Map(mapRef.current, {
      center: centerLatLng,
      level: 3,
      maxLevel: SAFE.MAP_MAX_LEVEL,
      draggable: true,
      scrollwheel: true,
    });

    // 줌 변경 시 강제 가드
    window.kakao.maps.event.addListener(map, "zoom_changed", function () {
      const lvl = map.getLevel();
      if (lvl > SAFE.MAP_MAX_LEVEL) map.setLevel(SAFE.MAP_MAX_LEVEL);
      setCurrentLevel(lvl);
    });

    // 생성 직후 한 번 초기화
    setCurrentLevel(map.getLevel());

    setMapInstance(map);

    // 지도가 완전히 로드된 후 resize 트리거
    window.kakao.maps.event.addListener(map, "tilesloaded", () => {
      console.log("[map] Tiles loaded, triggering resize");
      setTimeout(() => window.kakao.maps.event.trigger(map, "resize"), 100);
    });

    console.log("[map] Map created successfully");
  }, []);

  // ---------- 마커/버블 ----------
  const createMarkerElement = (store, imageSrc) => {
    const marker = document.createElement("div");
    marker.style.cssText =
      "width:50px;height:50px;background:#fff;border-radius:50%;display:flex;justify-content:center;align-items:center;box-shadow:1px 1px 4px 0 #E1E1E3;cursor:pointer;transform:scale(0);opacity:0;transition:opacity 0.4s ease,transform 0.4s ease;";
    const icon = document.createElement("img");
    icon.src = imageSrc;
    icon.alt = store.name;
    icon.style.width = "30px";
    icon.style.height = "30px";
    marker.appendChild(icon);
    marker.addEventListener("click", (e) => e.stopPropagation());

    // 부드러운 등장 애니메이션
    requestAnimationFrame(() => {
      marker.style.opacity = "1";
      marker.style.transform = "scale(1)";
    });

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
      </div>
    `;
    bubble.addEventListener("click", (e) => e.stopPropagation());
    setTimeout(() => bubble.querySelector(".custom-bubble")?.classList.add("show"), 10);
    return bubble;
  };

  const showBubbleOverlay = useCallback(
    (store, storePosition, imageSrc, opts = { useOffset: true, offsetLat: 0.0007 }) => {
      console.log("[bubble] Showing bubble overlay for store:", store.name, store);

      try {
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

        // 핵심: 현재위치 상태와 무관하게 selectedStore 설정
        console.log("[bubble] Setting selectedStore:", store);
        setSelectedStore(store);

        console.log("[bubble] Bubble overlay created successfully");
      } catch (error) {
        console.error("[bubble] Error creating bubble overlay:", error);
        // 에러가 발생해도 최소한 selectedStore는 설정하여 카드가 보이도록
        setSelectedStore(store);
      }
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

      console.log("[markers] Rendering markers:", stores.length);

      // 기존 마커들을 부드럽게 제거
      const removeMarkers = async () => {
        const promises = [];

        markersRef.current.forEach((m) => {
          if (m && m.setMap) {
            const promise = new Promise((resolve) => {
              const content = m.getContent?.();
              if (content) {
                // 부드러운 사라짐 애니메이션
                content.style.transition = "opacity 0.3s ease, transform 0.3s ease";
                content.style.opacity = "0";
                content.style.transform = "scale(0.8)";

                setTimeout(() => {
                  m.setMap(null);
                  // 이벤트 리스너도 정리
                  if (content.removeEventListener) {
                    content.removeEventListener("click", content._clickHandler);
                  }
                  resolve();
                }, 300);
              } else {
                m.setMap(null);
                resolve();
              }
            });
            promises.push(promise);
          }
        });

        // 모든 마커 제거 완료 대기
        await Promise.all(promises);
        markersRef.current = [];
      };

      // 기존 오버레이들도 부드럽게 제거
      const removeOverlays = async () => {
        const promises = [];

        Object.values(overlayMapRef.current.round).forEach((o) => {
          if (o && o.setMap) {
            const promise = new Promise((resolve) => {
              const content = o.getContent?.();
              if (content) {
                // 부드러운 사라짐 애니메이션
                content.style.transition = "opacity 0.3s ease, transform 0.3s ease";
                content.style.opacity = "0";
                content.style.transform = "scale(0.8)";

                setTimeout(() => {
                  o.setMap(null);
                  if (content.removeEventListener) {
                    content.removeEventListener("click", content._clickHandler);
                  }
                  resolve();
                }, 300);
              } else {
                o.setMap(null);
                resolve();
              }
            });
            promises.push(promise);
          }
        });

        // 모든 오버레이 제거 완료 대기
        await Promise.all(promises);
        overlayMapRef.current.round = {};
      };

      // 마커와 오버레이를 순차적으로 제거 후 새로 생성
      (async () => {
        await removeMarkers();
        await removeOverlays();

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

          // 클릭 핸들러를 함수로 분리하여 참조 보존
          const clickHandler = (e) => {
            console.log("[markers] Marker clicked:", store.name, store);
            e.stopPropagation();

            // 디버깅: 현재위치 상태와 무관하게 마커 클릭 처리
            try {
              showBubbleOverlay(store, pos, imageSrc);
              console.log("[markers] Bubble overlay shown successfully");
            } catch (error) {
              console.error("[markers] Failed to show bubble overlay:", error);
              // 에러가 발생해도 최소한 selectedStore는 설정
              setSelectedStore(store);
            }
          };

          // 이벤트 리스너 추가
          markerEl.addEventListener("click", clickHandler);
          // 참조 보존을 위해 핸들러를 요소에 저장
          markerEl._clickHandler = clickHandler;

          const roundOverlay = new window.kakao.maps.CustomOverlay({
            position: pos,
            content: markerEl,
            yAnchor: 1,
          });
          roundOverlay.setMap(mapInstance);
          overlayMapRef.current.round[key] = roundOverlay;

          markersRef.current.push(roundOverlay);
        });

        console.log("[markers] Rendered", markersRef.current.length, "markers");
      })();
    },
    [mapInstance, selectedCategory, showBubbleOverlay]
  );

  // ---------- 초기 로딩 ----------
  useEffect(() => {
    let mounted = true;

    (async () => {
      console.log("[init] Starting map initialization...");

      try {
        await ensureKakaoReady();
        if (!mounted) return;

        await waitForContainerSize();
        if (!mounted || isListMode) return;

        console.log("[init] Kakao SDK and container ready");

        // 우선순위: addressState → geolocation(3s, usable만) → lastGeo → 여의도
        let center = null;

        if (addressState?.lat && addressState?.lng) {
          center = { lat: addressState.lat, lng: addressState.lng };
          console.log("[init] Using addressState:", center);
        }

        if (!center) {
          try {
            console.log("[init] Getting current position...");
            const pos = await getPositionOnce({ timeout: 3000 });
            const { coords } = pos || {};
            if (isUsableCoords(coords)) {
              const { latitude, longitude } = coords;
              center = { lat: latitude, lng: longitude };
              writeLastGeo(latitude, longitude);
              console.log("[init] Using current position:", center);

              try {
                const geocoder = new window.kakao.maps.services.Geocoder();
                geocoder.coord2Address(longitude, latitude, (result, status) => {
                  const base = { lat: latitude, lng: longitude, isManual: false };
                  if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
                    setSelectedAddress({
                      ...base,
                      roadAddress: result[0].road_address?.address_name || "",
                      jibunAddress: result[0].address?.address_name || "",
                    });
                  } else {
                    setSelectedAddress((prev) => ({ ...(prev || {}), ...base }));
                  }
                });
              } catch (e) {
                console.warn("[init] Geocoding failed:", e);
              }
            } else {
              console.log("[init] Current position not usable");
            }
          } catch (error) {
            console.warn("[init] Getting position failed:", error);
          }
        }

        if (!center) {
          const last = readLastGeo();
          if (last) {
            center = last;
            console.log("[init] Using last known position:", center);
          }
        }

        // 기본값으로 서울 서초구 강남대로 27 사용
        if (!center) {
          center = DEFAULT_LOCATION;
          console.log("[init] Using default position (Seoul Seocho-gu):", center);
        }

        console.log("[init] Creating map with center:", center);
        createMap(center.lat, center.lng);
      } catch (error) {
        console.error("[init] Map initialization failed:", error);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createMap, isListMode, setSelectedAddress]);

  // 대형마트 의무휴업일 알림 표시 (경로가 /map일 때)
  useEffect(() => {
    if (window.location.pathname === "/map") {
      setShowMartNotice(true);
      // 5초 후 자동으로 숨김
      const timer = setTimeout(() => {
        setShowMartNotice(false);
      }, 2300);

      return () => clearTimeout(timer);
    }
  }, []);

  // 주소 변경 시 센터 이동
  useEffect(() => {
    if (!mapInstance || !addressState?.lat || !addressState?.lng) return;
    if (Date.now() < centerLockUntilRef.current) return;
    const newCenter = new window.kakao.maps.LatLng(addressState.lat, addressState.lng);
    mapInstance.setCenter(newCenter);
  }, [mapInstance, addressState?.lat, addressState?.lng]);

  // 현재 위치 마커(실시간 추적) — 권한 체크 개선 및 폴백 추가
  useEffect(() => {
    if (!mapInstance) return;

    let watchId = null;

    const startWatch = () => {
      console.log("[geo] Starting location watch...");
      watchId = navigator.geolocation.watchPosition(
        ({ coords }) => {
          console.log("[geo] Position update:", coords);
          if (!isUsableCoords(coords)) {
            console.log("[geo] Coords not usable, skipping");
            return;
          }
          const { latitude, longitude } = coords;
          const position = new window.kakao.maps.LatLng(latitude, longitude);

          writeLastGeo(latitude, longitude);

          if (!currentMarkerRef.current) {
            console.log("[geo] Creating new current location marker");
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
            console.log("[geo] Updating current location marker");
            currentMarkerRef.current.setPosition(position);
            currentMarkerRef.current.setMap(mapInstance);
          }
        },
        (error) => {
          console.warn("[geo] Watch position error:", error);
        },
        { enableHighAccuracy: false, maximumAge: 30000, timeout: 10000 }
      );
    };

    // 권한 체크 개선: 권한 체크 실패 시에도 시도
    const checkAndStartWatch = async () => {
      try {
        if (navigator.permissions?.query) {
          const permission = await navigator.permissions.query({ name: "geolocation" });
          console.log("[geo] Permission state:", permission.state);
          if (permission.state === "granted") {
            startWatch();
          } else if (permission.state === "prompt") {
            // 권한 요청 중이면 시도
            startWatch();
          }
        } else {
          // permissions API가 없으면 바로 시도
          startWatch();
        }
      } catch (error) {
        console.warn("[geo] Permission check failed, trying anyway:", error);
        startWatch();
      }
    };

    checkAndStartWatch();

    return () => {
      if (watchId != null) {
        console.log("[geo] Clearing location watch");
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [mapInstance]);

  // ---------- idle → BBOX 갱신(즉시) ----------
  useEffect(() => {
    if (!mapInstance) return;
    const snap = (v, step = 0.005) => Math.round(v / step) * step;

    const update = () => {
      const b = mapInstance.getBounds?.();
      if (!b) return;
      const lvl = mapInstance.getLevel?.();
      if (typeof lvl === "number") {
        setCurrentLevel(lvl);
      }
      const sw = b.getSouthWest();
      const ne = b.getNorthEast();
      const next = {
        minX: snap(sw.getLng()),
        minY: snap(sw.getLat()),
        maxX: snap(ne.getLng()),
        maxY: snap(ne.getLat()),
      };
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
      update();
    };
    window.kakao.maps.event.addListener(mapInstance, "idle", onIdle);
    onIdle();

    return () => {
      window.kakao.maps.event.removeListener(mapInstance, "idle", onIdle);
    };
  }, [mapInstance]);

  // 리스트 모드 기본 bbox
  useEffect(() => {
    if (isListMode && !bbox && addressState?.lat && addressState?.lng) {
      const span = 0.03;
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

  // ================= 전통시장 =================
  const { data: storesData = [], refetch } = useQuery({
    queryKey: ["markets", bbox?.minX, bbox?.minY, bbox?.maxX, bbox?.maxY],
    enabled: !!bbox && (!!mapInstance || isListMode) && !tooWide,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    keepPreviousData: true,
    staleTime: 60 * 1000,
    queryFn: async () => {
      try {
        await testLoginIfNeeded();
      } catch (e) {
        void e;
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
    refetchOnMount: false,
    keepPreviousData: true,
    staleTime: 60 * 1000,
    queryFn: async () => {
      try {
        await testLoginIfNeeded();
      } catch (e) {
        void e;
      }

      if (!bbox) return [];

      const controller = new AbortController();

      try {
        const results = await fetchMarts(bbox, controller);
        setNetError(false);
        return results;
      } catch (err) {
        console.warn("[marts] API 호출 실패:", err);
        setNetError(true);
        return [];
      }
    },
    select: (raw) =>
      raw
        .map((r) => {
          console.log("=== 대형마트 원본 데이터 ===", r);
          const m = mapMarketFromAPI(r);
          console.log("=== mapMarketFromAPI 결과 ===", m);
          const result = m && { ...m, type: "mart" };
          console.log("=== 최종 대형마트 데이터 ===", result);
          return result;
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
    if (!isListMode && addressState?.lat && addressState?.lng) {
      (async () => {
        await ensureKakaoReady();
        await waitForContainerSize();
        const base = { lat: addressState.lat, lng: addressState.lng };
        createMap(base.lat, base.lng);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isListMode, addressState?.lat, addressState?.lng]);

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
            top: 228,
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
          검색 범위가 넓어 일부 결과가 표시되지 않습니다. 지도를 확대하여 확인해 주세요.
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
          네트워크 연결이 원활하지 않아 일부 마커가 표시되지 않았습니다. 다시 시도해 주세요.
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

      {/* 대형마트 의무휴업일 알림 */}
      {showMartNotice && (
        <div
          style={{
            position: "fixed",
            top: 228,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 99999,
            background: "#5A5B6A",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: 30,
            fontSize: 14,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            maxWidth: "90%",
            textAlign: "center",
            lineHeight: 1.4,
            fontWeight: 400,
          }}
        >
          매월 <span style={{ color: "#58d848", fontWeight: "700" }}>둘째, 넷째</span> 주 일요일은{" "}
          <span style={{ color: "#58d848", fontWeight: "700" }}>대형마트</span> 의무휴업일입니다.
        </div>
      )}

      {isListMode ? (
        <StoreListView stores={filteredStores} onSelect={handleSelectFromList} />
      ) : (
        <>
          <KakaoMapBox ref={mapRef} />

          {/* 현위치 버튼: 개선된 에러 처리 및 로깅 */}
          <CurrentLocationButton
            onClick={async () => {
              console.log("[button] Current location button clicked");
              if (!mapInstance) {
                console.warn("[button] Map instance not ready");
                return;
              }

              try {
                console.log("[button] Getting current position...");
                const pos = await getPositionOnce({ timeout: 15000 });
                const { coords } = pos || {};

                console.log("[button] Position result:", coords);

                // usable 아니면 '조용히' 폴백
                if (!isUsableCoords(coords)) {
                  const fb =
                    readLastGeo() ||
                    (addressState?.lat && addressState?.lng
                      ? { lat: addressState.lat, lng: addressState.lng }
                      : DEFAULT_LOCATION); // 서울 서초구 강남대로 27
                  console.warn("[button] Coords not usable, fallback to:", fb);
                  mapInstance.panTo(new window.kakao.maps.LatLng(fb.lat, fb.lng));
                  return;
                }

                // 정상 좌표일 때만 저장/이동/역지오코딩
                const { latitude, longitude } = coords;
                writeLastGeo(latitude, longitude);
                console.log("[button] Moving to position:", { latitude, longitude });

                const kakaoPos = new window.kakao.maps.LatLng(latitude, longitude);
                mapInstance.panTo(kakaoPos);

                if (!currentMarkerRef.current) {
                  console.log("[button] Creating current location marker");
                  const markerImage = new window.kakao.maps.MarkerImage(
                    currentMarkerIcon,
                    new window.kakao.maps.Size(40, 40),
                    { offset: new window.kakao.maps.Point(20, 40) }
                  );
                  const marker = new window.kakao.maps.Marker({
                    position: kakaoPos,
                    image: markerImage,
                    zIndex: 10,
                  });
                  marker.setMap(mapInstance);
                  currentMarkerRef.current = marker;
                } else {
                  console.log("[button] Updating current location marker");
                  currentMarkerRef.current.setPosition(kakaoPos);
                  currentMarkerRef.current.setMap(mapInstance);
                }

                try {
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
                    } else {
                      setSelectedAddress((prev) => ({
                        ...(prev || {}),
                        lat: latitude,
                        lng: longitude,
                        isManual: false,
                      }));
                    }
                  });
                } catch (e) {
                  console.warn("[button] Geocoding failed:", e);
                }
              } catch (err) {
                console.error("[button] Current location error:", err);
                // 진짜 실패(권한 거부/API 불가)일 때만 안내
                let tip = "";
                switch (err?.code) {
                  case 1:
                    tip = "브라우저 사이트 권한에서 '위치'를 허용해 주세요.";
                    break;
                  case 2:
                    tip = "OS 위치 서비스가 꺼져 있거나 네트워크가 불안정합니다.";
                    break;
                  case 3:
                    tip = "응답이 지연되었습니다. 잠시 후 다시 시도해 주세요.";
                    break;
                  default:
                    tip = "알 수 없는 오류입니다.";
                }
                alert("현재 위치 권한이 없거나 측위에 실패했어.\n\n" + tip);
              }
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
