import { create } from "zustand";

const useHeaderStore = create((set, get) => ({
  title: "",
  showBack: false,
  showHeart: false,
  isVisible: false,
  isHeartActive: false,

  onHeartToggle: null,
  onHeartOn: null,
  onHeartOff: null,

  showHelp: false,
  onHelp: null,

  setTitle: (title) => set({ title }),
  setShowBack: (showBack) => set({ showBack }),
  setShowHeart: (showHeart) => set({ showHeart }),
  setIsVisible: (isVisible) => set({ isVisible }),
  setIsHeartActive: (isHeartActive) => set({ isHeartActive }),

  setOnHeartOn: (fn) => set({ onHeartOn: fn }),
  setOnHeartOff: (fn) => set({ onHeartOff: fn }),

  setOnHeartToggle: (fn) => set({ onHeartToggle: fn }),

  setShowHelp: (v) => set({ showHelp: v }),
  setOnHelp: (fn) => set({ onHelp: fn }),

  toggleHeart: () => {
    const state = get();

    if (state.onHeartToggle) {
      state.onHeartToggle();
    } else {
      const newActive = !state.isHeartActive;
      if (newActive) {
        state.onHeartOn?.();
      } else {
        state.onHeartOff?.();
      }
      set({ isHeartActive: newActive });
    }
  },

  resetHeader: () =>
    set({
      title: "",
      showBack: false,
      showHeart: false,
      isVisible: false,
      isHeartActive: false,
      onHeartToggle: null,
      onHeartOn: null,
      onHeartOff: null,
      showHelp: false,
      onHelp: null,
    }),
}));

export default useHeaderStore;
