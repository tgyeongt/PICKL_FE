/* eslint-disable react-hooks/exhaustive-deps */
import useHeaderStore from "../stores/useHeaderStore";
import { useEffect } from "react";

export default function useHeader({ title, showBack = false, showHeart = false }) {
  const setTitle = useHeaderStore((state) => state.setTitle);
  const setShowBack = useHeaderStore((state) => state.setShowBack);
  const setShowHeart = useHeaderStore((state) => state.setShowHeart);
  const resetHeader = useHeaderStore((state) => state.resetHeader);

  useEffect(() => {
    setTitle(title);
    setShowBack(showBack);
    setShowHeart(showHeart);

    return () => {
      resetHeader();
    };
  }, [title, showBack, showHeart]);
}
