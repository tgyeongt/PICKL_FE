import { create } from "zustand";

const useHeaderStore = create((set, get) => ({
  title: "",
  showBack: false,
  showHeart: false,
  isVisible: false,
  isHeartActive: false,
  onHeartToggle: null,

  toggleHeart: () => {
    const onToggle = get().onHeartToggle;
    if (onToggle) {
      onToggle();
    }
  },

  setTitle: (title) => set({ title }),
  setShowBack: (show) => set({ showBack: show }),
  setShowHeart: (show) => set({ showHeart: show }),
  setIsVisible: (visible) => set({ isVisible: visible }),
  setIsHeartActive: (active) => set({ isHeartActive: active }),
  setOnHeartToggle: (fn) => set({ onHeartToggle: fn }),

  resetHeader: () =>
    set({
      title: "",
      showBack: false,
      showHeart: false,
      isVisible: false,
      isHeartActive: false,
      onHeartToggle: null,
    }),
}));

export default useHeaderStore;
