const KEY = "recipeSeasonMap"; // { [recipeId]: { seasonItemId, cachedAt } }

export function getRecipeSeasonMap() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

export function setRecipeSeasonMap(map) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function upsertRecipeSeason(recipeId, seasonItemId) {
  const map = getRecipeSeasonMap();
  map[String(recipeId)] = { seasonItemId, cachedAt: Date.now() };
  setRecipeSeasonMap(map);
}

export function getSeasonIdByRecipe(recipeId) {
  return getRecipeSeasonMap()[String(recipeId)]?.seasonItemId ?? null;
}
