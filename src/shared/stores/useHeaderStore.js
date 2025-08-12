import { create } from "zustand";

const useHeaderStore = create((set) => ({
  title: "",
  showBack: false,
  showHeart: false,
  isVisible: false,

  onHeartOn: null,
  onHeartOff: null,
  isHeartActive: false,

  showHelp: false,
  onHelp: null,

  setTitle: (title) => set({ title }),
  setShowBack: (showBack) => set({ showBack }),
  setShowHeart: (showHeart) => set({ showHeart }),
  setOnHeartOn: (fn) => set({ onHeartOn: fn }),
  setOnHeartOff: (fn) => set({ onHeartOff: fn }),
  setIsVisible: (isVisible) => set({ isVisible }),
  setIsHeartActive: (isHeartActive) => set({ isHeartActive }),
  setShowHelp: (v) => set({ showHelp: v }),
  setOnHelp: (fn) => set({ onHelp: fn }),

  toggleHeart: () =>
    set((state) => {
      const newActive = !state.isHeartActive;
      if (newActive) {
        state.onHeartOn?.();
      } else {
        state.onHeartOff?.();
      }
      return { isHeartActive: newActive };
    }),

  resetHeader: () =>
    set({
      title: "",
      showBack: false,
      showHeart: false,
      onHeartClick: null,
      onHeartOn: null,
      onHeartOff: null,
      isVisible: false,
      isHeartActive: false,
      showHelp: false,
      onHelp: null,
    }),
}));

export default useHeaderStore;
