import { useState } from "react";
import MonthNavigator from "./MonthNavigator";
import MonthlyPickList from "./MonthlyPickList";
import useHeader from "@hooks/useHeader";

export default function MonthlyPick() {
  useHeader({
    title: "이달의 Pick",
    showBack: true,
  });

  // 더미데이터
  const monthlyPicksData = [
    {
      id: 1,
      month: 8,
      title: "수박",
      img: "/src/shared/assets/icon/home/watermelon.png",
      description: "시원한 과즙으로 더위를 날리는 \n 여름 대표 과일, 수박을 즐겨보세요!",
    },
    {
      id: 2,
      month: 8,
      title: "망고",
      img: "/src/shared/assets/icon/home/watermelon.png",
      description: "시원한 과즙으로 더위를 날리는 \n 여름 대표 과일, 수박을 즐겨보세요!",
    },
    {
      id: 3,
      month: 8,
      title: "문어",
      img: "/src/shared/assets/icon/home/watermelon.png",
      description: "시원한 과즙으로 더위를 날리는 \n 여름 대표 과일, 수박을 즐겨보세요!",
    },
    {
      id: 4,
      month: 8,
      title: "옥수수",
      img: "/src/shared/assets/icon/home/watermelon.png",
      description: "시원한 과즙으로 더위를 날리는 \n 여름 대표 과일, 수박을 즐겨보세요!",
    },
    {
      id: 5,
      month: 7,
      title: "자두",
      img: "/src/shared/assets/icon/home/watermelon.png",
      description: "시원한 과즙으로 더위를 날리는 \n 여름 대표 과일, 수박을 즐겨보세요!",
    },
  ];

  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1~12

  const handlePrev = () => {
    setCurrentMonth((prev) => (prev === 1 ? 12 : prev - 1));
  };

  const handleNext = () => {
    setCurrentMonth((prev) => (prev === 12 ? 1 : prev + 1));
  };

  const picks = monthlyPicksData.filter((item) => item.month === currentMonth);

  return (
    <>
      <MonthNavigator currentMonth={currentMonth} onPrev={handlePrev} onNext={handleNext} />
      <MonthlyPickList picks={picks} />
    </>
  );
}
