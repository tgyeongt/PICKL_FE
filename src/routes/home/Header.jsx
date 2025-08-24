import { useEffect, useState } from "react";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { APIService } from "../../shared/lib/api";

const PRODUCT_IDS = [
  { productNo: 1537, name: "쌀(10kg)" },
  { productNo: 411, name: "복숭아(10개)" },
  { productNo: 71, name: "계란(30구)" },
];

export default function Header() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItem, setVisibleItem] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const results = await Promise.all(
          PRODUCT_IDS.map(async (p) => {
            const res = await APIService.private.get(
              `/daily-price-change/store/items/${p.productNo}`
            );

            if (res.success && res.data) {
              const data = res.data;
              return {
                name: p.name,
                price: data.latestPrice,
                change: data.priceDiffRate,
              };
            }
            return null;
          })
        );

        const filtered = results.filter(Boolean);
        setItems(filtered);
        if (filtered.length > 0) setVisibleItem(filtered[0]);
      } catch (err) {
        console.error("상품 데이터 가져오기 실패:", err);
      }
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    if (items.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [items]);

  useEffect(() => {
    if (items.length > 0) {
      setVisibleItem(items[currentIndex]);
    }
  }, [currentIndex, items]);

  return (
    <Wrapper>
      <AnimatePresence mode="wait">
        {visibleItem && (
          <motion.div
            key={visibleItem.name}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: "flex", gap: "5px" }}
          >
            <span>{visibleItem.name}</span>
            <p className="price" data-positive={visibleItem.change >= 0}>
              {visibleItem.price.toLocaleString()}원 {visibleItem.change >= 0 ? "+" : ""}
              {visibleItem.change}%
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Wrapper>
  );
}

const Wrapper = styled.header`
  display: flex;
  align-items: center;
  width: 100%;
  height: 50px;
  min-width: 390px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 600;
  overflow: hidden;

  .price {
    color: #1677ff;

    &[data-positive="false"] {
      color: #e42938;
    }
  }
`;
