/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import useHeaderStore from "../stores/useHeaderStore";

export default function useHeader({
  title,
  showBack = false,
  showHeart = false,
  onHeartOn = null,
  onHeartOff = null,
}) {
  const setTitle = useHeaderStore((state) => state.setTitle);
  const setShowBack = useHeaderStore((state) => state.setShowBack);
  const setShowHeart = useHeaderStore((state) => state.setShowHeart);
  const setOnHeartOn = useHeaderStore((state) => state.setOnHeartOn);
  const setOnHeartOff = useHeaderStore((state) => state.setOnHeartOff);
  const setIsVisible = useHeaderStore((state) => state.setIsVisible);
  const resetHeader = useHeaderStore((state) => state.resetHeader);

  useEffect(() => {
    setTitle(title);
    setShowBack(showBack);
    setShowHeart(showHeart);
    setOnHeartOn(onHeartOn);
    setOnHeartOff(onHeartOff);
    setIsVisible(true);

    return () => {
      resetHeader();
    };
  }, [title, showBack, showHeart, onHeartOn, onHeartOff]);
}
