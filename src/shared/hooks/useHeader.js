import { useEffect, useCallback } from "react";
import useHeaderStore from "../stores/useHeaderStore";
import { APIService } from "../../shared/lib/api";

export default function useHeader({
  title,
  showBack = false,
  showHeart = false,
  targetType = null,
  targetId = null,
}) {
  const setTitle = useHeaderStore((state) => state.setTitle);
  const setShowBack = useHeaderStore((state) => state.setShowBack);
  const setShowHeart = useHeaderStore((state) => state.setShowHeart);
  const setOnHeartToggle = useHeaderStore((state) => state.setOnHeartToggle);
  const setIsVisible = useHeaderStore((state) => state.setIsVisible);
  const setIsHeartActive = useHeaderStore((state) => state.setIsHeartActive);
  const resetHeader = useHeaderStore((state) => state.resetHeader);

  const handleHeartToggle = useCallback(async () => {
    const state = useHeaderStore.getState();

    try {
      if (!state.isHeartActive) {
        await APIService.private.post("/favorites", {
          type: targetType,
          targetId: String(targetId),
        });
        setIsHeartActive(true);
      } else {
        await APIService.private.delete("/favorites", {
          params: { type: targetType, targetId },
        });
        setIsHeartActive(false);
      }
    } catch (err) {
      console.error("찜하기 처리 실패:", err);
    }
  }, [targetType, targetId, setIsHeartActive]);

  useEffect(() => {
    setTitle(title);
    setShowBack(showBack);
    setShowHeart(showHeart);
    setIsVisible(true);

    if (showHeart && targetType && targetId) {
      setOnHeartToggle(handleHeartToggle);
      setIsHeartActive(false);
    }

    return () => {
      resetHeader();
    };
  }, [
    title,
    showBack,
    showHeart,
    targetType,
    targetId,
    handleHeartToggle,
    setTitle,
    setShowBack,
    setShowHeart,
    setIsVisible,
    setOnHeartToggle,
    resetHeader,
    setIsHeartActive,
  ]);
}
