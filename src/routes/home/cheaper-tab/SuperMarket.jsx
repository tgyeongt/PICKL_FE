import { useEffect, useState } from "react";
import CheaperCard from "./CheaperCard";
import { APIService } from "../../../shared/lib/api";

export default function SuperMarket({ selected }) {
  const [superMarketList, setSuperMarketList] = useState([]);

  useEffect(() => {
    async function fetchSuperMarketItems() {
      try {
        const res = await APIService.private.get("/market-prices");
        const filtered = res.data.filter((item) => {
          const superPrice = Number(item.superMarketPrice);
          const marketPrice = Number(item.marketPrice);
          return superPrice < marketPrice;
        });
        setSuperMarketList(filtered);
      } catch (error) {
        console.error("Failed to fetch supermarket items:", error);
      }
    }
    fetchSuperMarketItems();
  }, []);

  if (superMarketList.length === 0) {
    return <p>저렴한 상품이 없습니다.</p>;
  }

  return (
    <>
      {superMarketList.map((item) => (
        <CheaperCard
          key={item.productName}
          selected={selected}
          name={item.productName}
          unit={item.unit}
          marketPrice={Number(item.marketPrice).toLocaleString()}
          superMarketPrice={Number(item.superMarketPrice).toLocaleString()}
        />
      ))}
    </>
  );
}
