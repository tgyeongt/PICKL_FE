import { useEffect, useRef } from "react";
import currentIcon from "@icon/map/currentIcon.svg";

export default function CheckLocationMap({ setMapInstance }) {
  const mapRef = useRef(null);

  const loadScript = () => {
    if (window.kakao && window.kakao.maps) return Promise.resolve();
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
    if (!window.kakao || !window.kakao.maps) {
      console.error("카카오맵 SDK가 로드되지 않았습니다.");
      return;
    }

    window.kakao.maps.load(() => {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords;

          const container = mapRef.current;
          const options = {
            center: new window.kakao.maps.LatLng(latitude, longitude),
            level: 3,
          };

          const map = new window.kakao.maps.Map(container, options);

          if (setMapInstance) {
            setMapInstance(map);
          }

          const markerImage = new window.kakao.maps.MarkerImage(
            currentIcon,
            new window.kakao.maps.Size(35, 50),
            {
              offset: new window.kakao.maps.Point(20, 40),
            }
          );

          new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(latitude, longitude),
            map: map,
            image: markerImage,
          });
        },
        (error) => {
          alert("위치 정보를 불러올 수 없습니다.");
          console.error(error);
        }
      );
    });
  };

  useEffect(() => {
    loadScript().then(createMap);
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}
