/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import useHeaderStore from "../stores/useHeaderStore";

export default function useHeader({
  title,
  showBack = false,
  showHeart = false,
  onHeartClick = null,
}) {
  const setTitle = useHeaderStore((state) => state.setTitle);
  const setShowBack = useHeaderStore((state) => state.setShowBack);
  const setShowHeart = useHeaderStore((state) => state.setShowHeart);
  const setOnHeartClick = useHeaderStore((state) => state.setOnHeartClick);
  const resetHeader = useHeaderStore((state) => state.resetHeader);

  useEffect(() => {
    setTitle(title);
    setShowBack(showBack);
    setShowHeart(showHeart);
    setOnHeartClick(onHeartClick);

    return () => {
      resetHeader();
    };
  }, [title, showBack, showHeart, onHeartClick]);
}
