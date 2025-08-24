import { useEffect, useState } from "react";
import CheaperCard from "./CheaperCard";
import { APIService } from "../../../shared/lib/api";
import LoadingSpinner from "../../../shared/commons/loading/LoadingSpinner";

export default function TraditionalMarket({ selected }) {
  const [marketList, setMarketList] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    }
    fetchMarketItems();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      {marketList.map((item) => (
        <CheaperCard
          key={item.productName}
          productNo={item.productNo}
          selected={selected}
          name={item.productName}
          img={item.imageUrl}
          unit={item.unit}
          marketPrice={Number(item.marketPrice).toLocaleString()}
          superMarketPrice={Number(item.superMarketPrice).toLocaleString()}
        />
      ))}
    </>
  );
}
