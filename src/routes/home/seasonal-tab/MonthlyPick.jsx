import { useState } from "react";
import MonthNavigator from "./MonthNavigator";
import MonthlyPickList from "./MonthlyPickList";
import useHeader from "@hooks/useHeader";
import seasonalList from "./seasonalList";

export default function MonthlyPick() {
  useHeader({
    title: "이달의 Pick",
    showBack: true,
  });

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1~12

  const handlePrev = () => {
    setCurrentMonth((prev) => (prev === 1 ? 12 : prev - 1));
  };

  const handleNext = () => {
    setCurrentMonth((prev) => (prev === 12 ? 1 : prev + 1));
  };

  const picks = seasonalList.filter((item) => item.month === currentMonth);

  return (
    <>
      <MonthNavigator currentMonth={currentMonth} onPrev={handlePrev} onNext={handleNext} />
      <MonthlyPickList picks={picks} />
    </>
  );
}
