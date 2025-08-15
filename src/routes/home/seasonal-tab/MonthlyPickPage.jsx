import { useState, useEffect } from "react";
import { APIService } from "../../../shared/lib/api";
import MonthNavigator from "./MonthNavigator";
import MonthlyPickList from "./MonthlyPickList";
import useHeader from "@hooks/useHeader";

export default function MonthlyPickPage() {
  useHeader({
    title: "이달의 Pick",
    showBack: true,
  });

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1);

  const handlePrev = () => {
    setCurrentMonth((prev) => (prev === 1 ? 12 : prev - 1));
  };

  const handleNext = () => {
    setCurrentMonth((prev) => (prev === 12 ? 1 : prev + 1));
  };

  const [seasonalList, setSeasonalList] = useState([]);

  useEffect(() => {
    async function fetchSeasonItems() {
      try {
        const res = await APIService.private.get("/season-items");
        setSeasonalList(res.data);
      } catch (error) {
        console.error("Failed to fetch season items:", error);
      }
    }
    fetchSeasonItems();
  }, []);

  const items = seasonalList.filter((item) => item.seasonMonth === currentMonth);

  return (
    <>
      <MonthNavigator currentMonth={currentMonth} onPrev={handlePrev} onNext={handleNext} />
      <MonthlyPickList items={items} />
    </>
  );
}
