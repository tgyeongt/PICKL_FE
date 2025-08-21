import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { selectedAddressAtom } from "./state/addressAtom";
import styled from "styled-components";
import backIcon from "@icon/map/backButtonIcon.svg";
import clearIcon from "@icon/map/x-circle.svg";
import DropdownIcon from "@icon/map/dropdown.svg";

import { APIService } from "../../shared/lib/api";
import { testLoginIfNeeded } from "../../shared/lib/auth";
import { mapMarketFromAPI } from "../../shared/lib/storeMappers";
import SearchResultList from "./SearchResultList";
import { useCallback } from "react";

function useDebounce(value, delay = 200) {
  const [v, setV] = useState(value);
  useMemo(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

const CHO = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
];
const HANGUL_BASE = 0xac00;
const HANGUL_LAST = 0xd7a3;
const CHO_UNIT = 21 * 28;

function toChosung(s = "") {
  let out = "";
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    if (code >= HANGUL_BASE && code <= HANGUL_LAST) {
      const choIndex = Math.floor((code - HANGUL_BASE) / CHO_UNIT);
      out += CHO[choIndex];
    } else {
      out += ch;
    }
  }
  return out;
}
const norm = (s = "") => s.toString().trim().toLowerCase();

/** q가 초성만으로 들어오든, 일반 문자열이든 모두 대응
 *  - 이름 포함: "길음" → "정릉시장" 미매칭, "길음시장" 매칭
 *  - 초성 시작: "ㅈ" → "정릉시장", "중앙", …
 *  - 초성 진행형: "ㅈㄹㅅ" → "정릉시장"
 */
function matchKorean(name = "", q = "") {
  if (!q) return false;
  const n = norm(name);
  const query = norm(q);
  if (n.includes(query)) return true;
  const nameCho = toChosung(name);
  if (nameCho.startsWith(q)) return true;
  return false;
}

export default function MapSearchPage() {
  const navigate = useNavigate();
  const selectedAddress = useAtomValue(selectedAddressAtom);
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebounce(keyword, 200);
  const handleSelectStore = useCallback(
    (store) => {
      navigate("/map", {
        state: {
          focusStore: store,
          from: "search",
          offsetLat: 0.002,
        },
        replace: false,
      });
    },
    [navigate]
  );

  const baseBbox = useMemo(() => {
    const lat = Number(selectedAddress?.lat) || 37.5665;
    const lng = Number(selectedAddress?.lng) || 126.978;
    const span = 0.05; // 리스트 검색 기준 거리 (0.05 = 5km)
    return { minX: lng - span, minY: lat - span, maxX: lng + span, maxY: lat + span };
  }, [selectedAddress?.lat, selectedAddress?.lng]);

  const buildMarketParams = (bbox) => ({
    minX: bbox.minX,
    minY: bbox.minY,
    maxX: bbox.maxX,
    maxY: bbox.maxY,
    page: 1,
    size: 50,
  });
  const buildMartParams = (bbox) => ({
    minX: Number(bbox.minX.toFixed(3)),
    minY: Number(bbox.minY.toFixed(3)),
    maxX: Number(bbox.maxX.toFixed(3)),
    maxY: Number(bbox.maxY.toFixed(3)),
    page: 1,
    size: 10,
  });

  const {
    data: markets = [],
    isLoading: loadingMarkets,
    isError: errorMarkets,
  } = useQuery({
    queryKey: ["markets", baseBbox],
    enabled: !!baseBbox,
    keepPreviousData: true,
    staleTime: 60 * 1000,
    retry: false,
    queryFn: async () => {
      try {
        await testLoginIfNeeded();
      } catch (e) {
        // 로그인 필요 없으면 무시
        // console.warn("[auth] testLoginIfNeeded 실패(무시 가능)", e);
      }
      const res = await APIService.private.get("/markets", { params: buildMarketParams(baseBbox) });
      const raw = Array.isArray(res) ? res : res?.data ?? res?.content ?? res?.items ?? res ?? [];
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : [];
      return list
        .map((r) => {
          const m = mapMarketFromAPI(r);
          return m && { ...m, type: "market" };
        })
        .filter(Boolean);
    },
  });

  const {
    data: marts = [],
    isLoading: loadingMarts,
    isError: errorMarts,
  } = useQuery({
    queryKey: ["marts", baseBbox],
    enabled: !!baseBbox,
    keepPreviousData: true,
    staleTime: 60 * 1000,
    retry: false,
    queryFn: async () => {
      try {
        await testLoginIfNeeded();
      } catch (err) {
        // 로그인 필요 없으면 무시
        // console.warn("[auth] testLoginIfNeeded 실패(무시 가능)", e);
      }
      const res = await APIService.private.get("/marts", { params: buildMartParams(baseBbox) });
      const raw = Array.isArray(res) ? res : res?.data ?? res?.content ?? res?.items ?? res ?? [];
      const list = Array.isArray(raw) ? raw : Array.isArray(raw?.content) ? raw.content : [];
      return list
        .map((r) => {
          const m = mapMarketFromAPI(r);
          return m && { ...m, type: "mart" };
        })
        .filter(Boolean);
    },
  });

  const merged = useMemo(() => {
    const map = new Map();
    [...markets, ...marts].forEach((s) => {
      const key = s?.id ?? `${s?.latitude},${s?.longitude},${s?.name}`;
      if (!map.has(key)) map.set(key, s);
    });
    return Array.from(map.values());
  }, [markets, marts]);

  const filtered = useMemo(() => {
    const q = debouncedKeyword.trim();
    if (!q) return [];
    return merged.filter((s) => matchKorean(s?.name, q));
  }, [merged, debouncedKeyword]);

  const isLoading = loadingMarkets || loadingMarts;
  const isError = errorMarkets || errorMarts;

  return (
    <MapSearchWrapper>
      <BackButton onClick={() => navigate(-1)}>
        <BackIcon src={backIcon} alt="뒤로가기" />
      </BackButton>

      <MapSearchBox>
        <SearchBar>
          <SearchInput
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="시장 or 마트를 검색해보세요"
          />
          {keyword && (
            <ClearButton onClick={() => setKeyword("")}>
              <ClearIcon src={clearIcon} alt="지우기" />
            </ClearButton>
          )}
        </SearchBar>

        {keyword ? (
          <SearchInfoText>
            <GreenText>{keyword}</GreenText>으로 검색된 결과{" "}
            <GreenText>{isLoading ? "로딩중" : filtered.length}</GreenText>건
          </SearchInfoText>
        ) : (
          <LocationBox onClick={() => navigate("/map/edit-location")}>
            <AddressTextWrapper>
              <AddressText>
                {selectedAddress.roadAddress || selectedAddress.jibunAddress}
              </AddressText>
              <DropdownImg src={DropdownIcon} alt="드롭다운" />
            </AddressTextWrapper>
          </LocationBox>
        )}
        <SearchResultList
          stores={keyword ? filtered : []}
          loading={isLoading}
          error={isError && filtered.length === 0}
          onSelect={handleSelectStore}
        />
      </MapSearchBox>
    </MapSearchWrapper>
  );
}

const MapSearchWrapper = styled.div`
  display: flex;
  flex-direction: row;
  min-height: 100vh;
  width: 100%;
  overflow-y: auto;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 13px;
`;
const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px 0;
  display: flex;
  align-items: center;
  width: 35px;
  height: 35px;
`;
const BackIcon = styled.img`
  width: 24px;
  height: 24px;
`;
const MapSearchBox = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
  margin-top: 5px;
  padding-bottom: 80px;
`;
const SearchBar = styled.div`
  width: 100%;
  height: 35px;
  display: flex;
  align-items: center;
  position: relative;
  padding: 5px 15px;
  border-radius: 15px;
  background: #eaeaed;
`;
const SearchInput = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: #333;
  font-size: 12px;
  font-weight: 500;
  margin-left: 11px;
  &::placeholder {
    color: #adadaf;
  }
`;
const ClearButton = styled.button`
  background: none;
  border: none;
  position: absolute;
  right: 12px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  padding: 0;
`;
const ClearIcon = styled.img`
  width: 18px;
  height: 18px;
`;
const LocationBox = styled.div`
  cursor: pointer;
`;
const AddressTextWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 3px;
`;
const AddressText = styled.span`
  color: #000;
  font-size: 13.5px;
  font-weight: 700;
  line-height: 20px;
`;
const DropdownImg = styled.img`
  width: 9.5px;
  height: 8px;
`;
const SearchInfoText = styled.p`
  font-size: 13.5px;
  line-height: 20px;
  font-weight: 500;
  color: #1c1b1a;
`;
const GreenText = styled.span`
  color: #58d748;
`;
