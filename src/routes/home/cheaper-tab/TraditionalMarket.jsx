import { useEffect, useState } from "react";
import CheaperCard from "./CheaperCard";
import { APIService } from "../../../shared/lib/api";

export default function TraditionalMarket({ selected }) {
  const [marketList, setMarketList] = useState([]);

  useEffect(() => {
    async function fetchMarketItems() {
      try {
        const res = await APIService.private.get("/market-prices");
        const filtered = res.data.filter((item) => {
          const superPrice = Number(item.superMarketPrice);
          const marketPrice = Number(item.marketPrice);
          return superPrice > marketPrice;
        });
        setMarketList(filtered);
      } catch (error) {
        console.error("Failed to fetch supermarket items:", error);
      }
    }
    fetchMarketItems();
  }, []);

  return (
    <>
      {marketList.map((item) => (
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
