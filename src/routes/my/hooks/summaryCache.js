export function bumpSummaryCount(qc, key, delta) {
  qc.setQueryData(["me", "summary"], (prev) => {
    if (!prev) return prev;
    const next = { ...prev };
    const cur = Number(prev?.[key] ?? 0);
    next[key] = Math.max(0, cur + delta);
    return next;
  });
}
