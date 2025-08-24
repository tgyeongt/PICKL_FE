import { useEffect, useState } from "react";

const DEFAULT_LOCATION = {
  lat: 37.5013,
  lng: 127.0254,
  name: "서울 서초구 강남대로 27",
};

function isUsableCoords(coords) {
  const lat = Number(coords?.latitude);
  const lng = Number(coords?.longitude);
  const acc = Number(coords?.accuracy ?? 99999);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return false;
  }

  if (acc > 200000) {
    return false;
  }

  return true;
}

export default function useCurrentAddress(enabled = true) {
  const [address, setAddress] = useState(DEFAULT_LOCATION.name);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
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
          if (!isUsableCoords(coords)) {
            setAddress(DEFAULT_LOCATION.name);
            setIsLoading(false);
            return;
          }

          const { latitude, longitude } = coords;
          const geocoder = new window.kakao.maps.services.Geocoder();

          geocoder.coord2Address(longitude, latitude, (result, status) => {
            if (status === window.kakao.maps.services.Status.OK) {
              const addr =
                result[0].road_address?.address_name ||
                result[0].address?.address_name ||
                DEFAULT_LOCATION.name;
              setAddress(addr);
            } else {
              setAddress(DEFAULT_LOCATION.name);
            }
            setIsLoading(false);
          });
        },
        () => {
          setAddress(DEFAULT_LOCATION.name);
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
  }, [enabled]);

  return { address, isLoading };
}
