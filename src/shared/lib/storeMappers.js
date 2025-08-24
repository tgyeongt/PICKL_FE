const inferType = (s) => {
  const t = (s?.type ?? "").toString().trim().toLowerCase();
  if (t === "market" || t === "mart") return t;

  const c = (s?.category ?? "").toString();

  // 새로운 대형마트 API의 카테고리 체크
  if (c === "HYPERMARKET" || c === "SUPERMARKET" || c === "MART") {
    return "mart";
  }

  const isTraditional =
    c.includes("시장") ||
    c.includes("전통") ||
    c.includes("상설") ||
    c.includes("골목") ||
    c.includes("재래");

  return isTraditional ? "market" : "mart";
};

export const mapMarketFromAPI = (s) => {
  const lat = Number(s?.lat);
  const lng = Number(s?.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    console.warn("[mapMarketFromAPI] 잘못된 좌표 스킵:", s);
    return null;
  }

  const type = inferType(s);

  return {
    id: s.id,
    name: s.name,
    type: type,
    address: s.address ?? "",
    latitude: lat,
    longitude: lng,
    parking: Boolean(s?.parking ?? false),
    imageUrl: s.imageUrl || "",
    rawCategory: s.category,
    // 대형마트인 경우 brandCode도 추가
    brandCode: type === "mart" ? s.brandCode : undefined,
  };
};

export { inferType };
