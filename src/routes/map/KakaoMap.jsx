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
import { useAtom } from "jotai";
import { selectedCategoryAtom } from "./state/CategoryState";

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

  const renderMarkers = () => {
    if (!mapInstance || !storesData) return;

    markers.forEach((marker) => marker.setMap(null));

    const bounds = mapInstance.getBounds();
    const newMarkers = [];

    storesData.forEach((store) => {
      const storePosition = new window.kakao.maps.LatLng(store.latitude, store.longitude);

      if (!bounds.contain(storePosition)) return;

      if (selectedCategory !== "all" && store.type !== selectedCategory) return;

      const imageSrc = store.type === "market" ? marketIcon : martIcon;
      const imageSize = new window.kakao.maps.Size(40, 40);
      const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);

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
