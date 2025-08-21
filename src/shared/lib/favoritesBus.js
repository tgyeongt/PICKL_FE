const KEY = "__pickl_favorites_bus__";

const bus = (typeof window !== "undefined" && (window[KEY] ||= { listeners: new Set() })) || {
  listeners: new Set(),
};

/**
 * 구독 등록
 * @param {(payload:{type:'RECIPE'|'INGREDIENT', id:string, willFavorite:boolean})=>void} cb
 * @returns {()=>void} unsubscribe
 */
export function onFavoriteChange(cb) {
  bus.listeners.add(cb);
  return () => bus.listeners.delete(cb);
}

/**
 * 변경사항 브로드캐스트
 * @param {{type:'RECIPE'|'INGREDIENT', id:string|number, willFavorite:boolean}} payload
 */
export function emitFavoriteChange(payload) {
  const norm = {
    type: String(payload?.type || "").toUpperCase(),
    id: String(payload?.id ?? ""),
    willFavorite: !!payload?.willFavorite,
  };
  bus.listeners.forEach((cb) => {
    try {
      cb(norm);
    } catch (e) {
      void e;
    }
  });
}
