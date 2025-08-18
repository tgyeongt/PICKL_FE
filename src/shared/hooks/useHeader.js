import { useEffect, useCallback } from "react";
import useHeaderStore from "../stores/useHeaderStore";
import useToastStore from "../stores/useToastStore";
import { APIService } from "../lib/api";

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
        } catch (_) {
          // 로컬 스토리지 에러 시 반응 없도록
        }
        showToast(
          `관심 ${targetLabel}에 추가됐어요`,
          "success",
          isRecipe ? "/my/list-recipes" : "/my/list-ingredients"
        );
      } else {
        await APIService.private.delete("/favorites", {
          params: { type: targetType, targetId },
        });
        setIsHeartActive(false);
        try {
          window.localStorage.removeItem(storageKey);
        } catch (_) {
          // 로컬 스토리지 에러 시 반응 없도록
        }
        showToast(`관심 ${targetLabel}에서 삭제됐어요`, "success", null);
      }
    } catch (err) {
      console.error("찜하기 처리 실패:", err);
      showToast("작업 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.", "error");
    }
  }, [targetType, targetId, setIsHeartActive, showToast]);

  useEffect(() => {
    setTitle(title);
    setShowBack(showBack);
    setShowHeart(showHeart);
    setIsVisible(true);

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
