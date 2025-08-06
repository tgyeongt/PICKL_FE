import { useEffect, useRef } from "react";

export default function CheckLocationMap() {
  const mapRef = useRef(null);

  const loadScript = () => {
    // 이미 로드되었는지 확인
    if (window.kakao && window.kakao.maps) return Promise.resolve();

    // 중복 로딩 방지
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
      // 위치 정보 받아오기
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords;

          const container = mapRef.current;
          const options = {
            center: new window.kakao.maps.LatLng(latitude, longitude),
            level: 3,
          };

          const map = new window.kakao.maps.Map(container, options);

          new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(latitude, longitude),
            map: map,
          });
        },
        (err) => {
          console.error("위치 정보를 가져올 수 없습니다:", err);
        }
      );
    });
  };

  useEffect(() => {
    loadScript().then(createMap);
  }, []);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}
