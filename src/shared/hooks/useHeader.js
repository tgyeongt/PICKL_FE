import { useEffect, useCallback } from "react";
import useHeaderStore from "../stores/useHeaderStore";
import useToastStore from "../stores/useToastStore";
import { APIService } from "../lib/api";

/* ✅ 추가: 캐시/전역 동기화를 위해 */
import { useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { favoriteRecipesCountAtom } from "../../routes/my/state/favoriteRecipesCountAtom";

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

  /* ✅ 추가: 전역 캐시/atom 접근자 */
  const qc = useQueryClient();
  const setFavRecipesCount = useSetAtom(favoriteRecipesCountAtom);

  /* ✅ 추가: 요약 캐시의 숫자 필드를 즉시 증감시키는 헬퍼 */
  const bumpSummaryCount = useCallback(
    (key, delta) => {
      qc.setQueryData(["me", "summary"], (prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        const cur = Number(prev?.[key] ?? 0);
        next[key] = Math.max(0, cur + delta);
        return next;
      });
    },
    [qc]
  );

  const handleHeartToggle = useCallback(async () => {
    const state = useHeaderStore.getState();
    const storageKey = `favorite:${String(targetType)}:${String(targetId)}`;
    const isRecipe = targetType === "RECIPE";
    const targetLabel = isRecipe ? "레시피" : "식재료";

    try {
      if (!state.isHeartActive) {
        // ✅ 찜 등록
        await APIService.private.post("/favorites", {
          type: targetType,
          targetId: String(targetId),
        });
        setIsHeartActive(true);

        // ✅ 즉시 전역 반영: 요약 캐시 & (레시피인 경우) atom
        bumpSummaryCount(isRecipe ? "favoriteRecipeCount" : "favoriteIngredientCount", +1);
        if (isRecipe) {
          setFavRecipesCount((prev) => Math.max(0, (typeof prev === "number" ? prev : 0) + 1));
        }

        // (선택) 상세/목록의 정합성 위해 무효화
        qc.invalidateQueries({ queryKey: ["favorites", "recipes"] });

        try {
          window.localStorage.setItem(storageKey, "true");
        } catch (e) {
          void e;
        }

        showToast?.(
          `관심 ${targetLabel}에 추가됐어요`,
          "success",
          isRecipe ? "/my/list-recipes" : "/my/list-ingredients"
        );

        state.onHeartOn?.();
      } else {
        // ✅ 찜 해제
        await APIService.private.delete("/favorites", {
          params: { type: targetType, targetId },
        });
        setIsHeartActive(false);

        // ✅ 즉시 전역 반영
        bumpSummaryCount(isRecipe ? "favoriteRecipeCount" : "favoriteIngredientCount", -1);
        if (isRecipe) {
          setFavRecipesCount((prev) => {
            const cur = typeof prev === "number" ? prev : 0;
            return Math.max(0, cur - 1);
          });
        }

        qc.invalidateQueries({ queryKey: ["favorites", "recipes"] });

        try {
          window.localStorage.removeItem(storageKey);
        } catch (e) {
          void e;
        }

        showToast?.(`관심 ${targetLabel}에서 삭제됐어요`, "success", null);

        state.onHeartOff?.();
      }
    } catch (err) {
      console.error("찜하기 처리 실패:", err);
      showToast?.("작업 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.", "error");
    }
  }, [targetType, targetId, setIsHeartActive, showToast, qc, bumpSummaryCount, setFavRecipesCount]);

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
