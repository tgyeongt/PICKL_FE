import { create } from "zustand";

const useHeaderStore = create((set) => ({
  title: "",
  showBack: false,
  showHeart: false,

  setTitle: (title) => set({ title }),
  setShowBack: (showBack) => set({ showBack }),
  setShowHeart: (showHeart) => set({ showHeart }),

  resetHeader: () => set({ title: "", showBack: false, showHeart: false }),
}));

export default useHeaderStore;
