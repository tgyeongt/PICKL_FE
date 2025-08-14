import { useEffect, useState } from "react";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";

const items = [
  { name: "쌀(20kg)", price: 58636, change: -0.45 },
  { name: "복숭아(10개)", price: 22426, change: +6.12 },
  { name: "계란(30개)", price: 32746, change: -1.77 },
];

export default function Header() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleItem, setVisibleItem] = useState(items[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setVisibleItem(items[currentIndex]);
  }, [currentIndex]);

  return (
    <Wrapper>
      <AnimatePresence mode="wait">
        <motion.div
          key={visibleItem.name}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: "flex", gap: "5px" }}
        >
          <p>{visibleItem.name}</p>
          <p className="price" data-positive={visibleItem.change >= 0}>
            {visibleItem.price.toLocaleString()}원 {visibleItem.change >= 0 ? "+" : ""}
            {visibleItem.change}%
          </p>
        </motion.div>
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
      color: red;
    }
  }
`;
