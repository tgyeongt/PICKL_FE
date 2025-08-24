import { useEffect, useCallback } from "react";
import useHeaderStore from "../stores/useHeaderStore";
import useToastStore from "../stores/useToastStore";
import { APIService } from "../lib/api";

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

  const setShowHelp = useHeaderStore((s) => s.setShowHelp)?.bind?.(null) || null;
  const setOnHelp = useHeaderStore((s) => s.setOnHelp)?.bind?.(null) || null;

  const setOnHeartOn = useHeaderStore((s) => s.setOnHeartOn)?.bind?.(null) || null;
  const setOnHeartOff = useHeaderStore((s) => s.setOnHeartOff)?.bind?.(null) || null;

  const { showToast } = useToastStore.getState();

  const handleHeartToggle = useCallback(async () => {
    const state = useHeaderStore.getState();
    const storageKey = `favorite:${String(targetType)}:${String(targetId)}`;
    const isRecipe = targetType === "RECIPE";
    const targetLabel = isRecipe ? "레시피" : "식재료";

    try {
      if (!state.isHeartActive) {
        await APIService.private.post("/favorites", {
          type: targetType,
          targetId: String(targetId),
        });
        setIsHeartActive(true);

        try {
          window.localStorage.setItem(storageKey, "true");
          // 찜하기 성공 시 이벤트 발생
          window.dispatchEvent(
            new CustomEvent("favorite:change", {
              detail: { type: targetType, id: targetId, willFavorite: true },
            })
          );
        } catch (_) {
          /* no-op */
        }

        showToast?.(
          `관심 ${targetLabel}에 추가됐어요`,
          "success",
          isRecipe ? "/my/list-recipes" : "/my/list-ingredients"
        );

        state.onHeartOn?.();
      } else {
        await APIService.private.delete("/favorites", {
          params: { type: targetType, targetId },
        });
        setIsHeartActive(false);

        try {
          window.localStorage.removeItem(storageKey);
          // 찜 해제 성공 시 이벤트 발생
          window.dispatchEvent(
            new CustomEvent("favorite:change", {
              detail: { type: targetType, id: targetId, willFavorite: false },
            })
          );
        } catch (_) {
          /* no-op */
        }

        showToast?.(`관심 ${targetLabel}에서 삭제됐어요`, "success", null);

        state.onHeartOff?.();
      }
    } catch (err) {
      console.error("찜하기 처리 실패:", err);
      showToast?.("작업 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.", "error");
    }
  }, [targetType, targetId, setIsHeartActive, showToast]);

  useEffect(() => {
    setTitle(title);
    setShowBack(showBack);
    setShowHeart(showHeart);
    setIsVisible(true);

    setShowHelp?.(showHelp);
    setOnHelp?.(onHelp);

    setOnHeartOn?.(onHeartOn);
    setOnHeartOff?.(onHeartOff);

    if (showHeart && targetType && targetId) {
      setOnHeartToggle(handleHeartToggle);
      try {
        const storageKey = `favorite:${String(targetType)}:${String(targetId)}`;
        const saved = window.localStorage.getItem(storageKey) === "true";
        setIsHeartActive(saved);
      } catch (_) {
        setIsHeartActive(false);
      }
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
    setIsVisible,
    setOnHeartToggle,
    resetHeader,
    setIsHeartActive,
    setShowHelp,
    setOnHelp,
    setOnHeartOn,
    setOnHeartOff,
  ]);
}
