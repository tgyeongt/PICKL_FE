import { create } from "zustand";

const useHeaderStore = create((set) => ({
  title: "",
  showBack: false,
  showHeart: false,
  onHeartClick: null,

  setTitle: (title) => set({ title }),
  setShowBack: (showBack) => set({ showBack }),
  setShowHeart: (showHeart) => set({ showHeart }),
  setOnHeartClick: (fn) => set({ onHeartClick: fn }),

  resetHeader: () =>
    set({
      title: "",
      showBack: false,
      showHeart: false,
      onHeartClick: null,
    }),
}));

export default useHeaderStore;
