import { useEffect, useState } from "react";

export default function useCurrentAddress() {
  const [address, setAddress] = useState("주소 없음");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadKakaoService = async () => {
      if (!(window.kakao && window.kakao.maps && window.kakao.maps.services)) {
        await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${
            import.meta.env.VITE_KAKAOMAP_APP_KEY
          }&autoload=false&libraries=services`;
          script.async = true;
          script.onload = () => {
            window.kakao.maps.load(resolve);
          };
          document.head.appendChild(script);
        });
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude } = coords;
          const geocoder = new window.kakao.maps.services.Geocoder();

          geocoder.coord2Address(longitude, latitude, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const addr =
                result[0].road_address?.address_name ||
                result[0].address?.address_name ||
                "주소 없음";
              setAddress(addr);
            } else {
              setAddress("주소 없음");
            }
            setIsLoading(false);
          });
        },
        (err) => {
          console.error("위치 접근 실패:", err);
          setAddress("주소 없음");
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 5000,
        }
      );
    };

    loadKakaoService();
  }, []);

  return { address, isLoading };
}
