import { useEffect, useRef } from "react";

export default function KakaoMap() {
  const mapRef = useRef(null);

  // ✅ Kakao SDK 스크립트 삽입 함수
  const loadKakaoMapScript = () => {
    return new Promise((resolve, reject) => {
      // 이미 스크립트가 있으면 바로 resolve
      if (document.querySelector("script[src*='dapi.kakao.com']")) {
        return resolve();
      }

      const script = document.createElement("script");
      script.src =
        "https://dapi.kakao.com/v2/maps/sdk.js?appkey=c05faa78d31f19a5ef1a585bcf1333c5&autoload=false";
      script.async = true;

      script.onload = () => {
        console.log("🟢 Kakao SDK 스크립트 로드 성공");
        resolve();
      };

      script.onerror = (error) => {
        console.error("❌ Kakao SDK 스크립트 로드 실패", error);
        reject(error);
      };

      document.head.appendChild(script);
    });
  };

  // ✅ 지도 생성 로직
  const initMap = () => {
    if (!window.kakao || !window.kakao.maps) {
      console.error("❌ window.kakao.maps 객체가 없습니다");
      return;
    }

    window.kakao.maps.load(() => {
      console.log("🟢 kakao.maps.load() 호출됨");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const container = mapRef.current;

          console.log("📍 현재 위치:", latitude, longitude);
          console.log("🗺 지도 컨테이너:", container);

          const options = {
            center: new window.kakao.maps.LatLng(latitude, longitude),
            level: 3,
          };

          try {
            new window.kakao.maps.Map(container, options);
            console.log("🟢 카카오 지도 생성 완료");
          } catch (error) {
            console.error("❌ 지도 생성 중 오류 발생", error);
          }
        },
        (error) => {
          console.error("📛 Geolocation 에러:", error);
        }
      );
    });
  };

  useEffect(() => {
    console.log("✅ KakaoMap 컴포넌트 마운트됨");

    loadKakaoMapScript()
      .then(() => {
        let attempts = 0;
        const tryLoadMap = () => {
          if (window.kakao && window.kakao.maps) {
            initMap();
          } else {
            attempts++;
            console.warn(`⏳ 아직 window.kakao.maps 없음 → ${attempts}번째 재시도`);
            if (attempts < 10) {
              setTimeout(tryLoadMap, 300);
            } else {
              console.error("❌ 10번 재시도했지만 kakao.maps 객체 없음");
            }
          }
        };

        tryLoadMap();
      })
      .catch((e) => {
        console.error("❌ SDK 로딩 중 예외 발생", e);
      });
  }, []);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100vh", // 뷰포트 기준 전체 높이
        backgroundColor: "lightblue",
      }}
    />
  );
}
