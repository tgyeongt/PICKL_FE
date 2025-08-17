import { useEffect, useCallback } from "react";
import useHeaderStore from "../stores/useHeaderStore";
import { APIService } from "../../shared/lib/api";

export default function useHeader({
  title,
  showBack = false,
  showHeart = false,
  onHeartOn = null,
  onHeartOff = null,
  showHelp = false,
  onHelp = null,
  targetType = null,
  targetId = null,
}) {
  const setTitle = useHeaderStore((s) => s.setTitle);
  const setShowBack = useHeaderStore((s) => s.setShowBack);
  const setShowHeart = useHeaderStore((s) => s.setShowHeart);
  const setOnHeartToggle = useHeaderStore((s) => s.setOnHeartToggle);
  const setIsVisible = useHeaderStore((s) => s.setIsVisible);
  const setIsHeartActive = useHeaderStore((s) => s.setIsHeartActive);
  const resetHeader = useHeaderStore((s) => s.resetHeader);
  const setShowHelp = useHeaderStore((s) => s.setShowHelp);
  const setOnHelp = useHeaderStore((s) => s.setOnHelp);
  const setOnHeartOn = useHeaderStore((s) => s.setOnHeartOn);
  const setOnHeartOff = useHeaderStore((s) => s.setOnHeartOff);

  const handleHeartToggle = useCallback(async () => {
    const state = useHeaderStore.getState();

    try {
      if (!state.isHeartActive) {
        await APIService.private.post("/favorites", {
          type: targetType,
          targetId: String(targetId),
        });
        setIsHeartActive(true);
        state.onHeartOn?.();
      } else {
        await APIService.private.delete("/favorites", {
          params: { type: targetType, targetId },
        });
        setIsHeartActive(false);
        state.onHeartOff?.();
      }
    } catch (err) {
      console.error("찜하기 처리 실패:", err);
    }
  }, [targetType, targetId, setIsHeartActive]);

  useEffect(() => {
    setTitle(title);
    setShowBack(showBack);
    setShowHeart(showHeart);

    setShowHelp(showHelp);
    setOnHelp(onHelp);

    setOnHeartOn?.(onHeartOn);
    setOnHeartOff?.(onHeartOff);

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
    showHelp,
    onHelp,
    onHeartOn,
    onHeartOff,
    targetType,
    targetId,
    handleHeartToggle,
    setTitle,
    setShowBack,
    setShowHeart,
    setShowHelp,
    setOnHelp,
    setIsVisible,
    setOnHeartToggle,
    resetHeader,
    setIsHeartActive,
    setOnHeartOn,
    setOnHeartOff,
  ]);
}
