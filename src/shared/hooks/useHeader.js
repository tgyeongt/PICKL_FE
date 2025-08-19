import { useEffect, useCallback, useRef, useMemo } from "react";
import useHeaderStore from "../stores/useHeaderStore";
import useToastStore from "../stores/useToastStore";
import { APIService } from "../lib/api";

import { useQueryClient } from "@tanstack/react-query";
import { useSetAtom } from "jotai";
import { favoriteRecipesCountAtom } from "../../routes/my/state/favoriteRecipesCountAtom";
import { onFavoriteChange, emitFavoriteChange } from "../lib/favoritesBus";

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

  const qc = useQueryClient();
  const setFavRecipesCount = useSetAtom(favoriteRecipesCountAtom);

  const normType = useMemo(() => String(targetType || "").toUpperCase(), [targetType]);
  const normId = useMemo(() => String(targetId ?? ""), [targetId]);

  const didInitRef = useRef(false);

  useEffect(() => {
    didInitRef.current = false;
  }, [normType, normId]);

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
    if (!normType || !normId) return;

    const isRecipe = normType === "RECIPE";
    const targetLabel = isRecipe ? "레시피" : "식재료";
    const storageKey = `favorite:${normType}:${normId}`;

    try {
      if (!state.isHeartActive) {
        await APIService.private.post("/favorites", { type: normType, targetId: normId });
        setIsHeartActive(true);

        emitFavoriteChange({ type: normType, id: normId, willFavorite: true });

        bumpSummaryCount(isRecipe ? "favoriteRecipeCount" : "favoriteIngredientCount", +1);
        if (isRecipe) {
          setFavRecipesCount((prev) => Math.max(0, (typeof prev === "number" ? prev : 0) + 1));
        }

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
        await APIService.private.delete("/favorites", {
          params: { type: normType, targetId: normId },
        });
        setIsHeartActive(false);

        emitFavoriteChange({ type: normType, id: normId, willFavorite: false });

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
  }, [normType, normId, setIsHeartActive, showToast, qc, bumpSummaryCount, setFavRecipesCount]);

  useEffect(() => {
    setTitle(title);
    setShowBack(showBack);
    setShowHeart(showHeart);
    setIsVisible(true);

    setShowHelp?.(showHelp);
    setOnHelp?.(onHelp);

    setOnHeartOn?.(onHeartOn);
    setOnHeartOff?.(onHeartOff);

    let off;

    if (showHeart && normType && normId) {
      setOnHeartToggle(handleHeartToggle);

      if (!didInitRef.current) {
        try {
          const storageKey = `favorite:${normType}:${normId}`;
          const saved = window.localStorage.getItem(storageKey) === "true";
          setIsHeartActive(!!saved);
        } catch {
          setIsHeartActive(false);
        }
        didInitRef.current = true;
      }

      off = onFavoriteChange(({ type, id, willFavorite }) => {
        if (type === normType && id === normId) {
          setIsHeartActive(!!willFavorite);
        }
      });
    }

    return () => {
      off?.();
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
    normType,
    normId,
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
