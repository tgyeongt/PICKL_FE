import { create } from "zustand";

const useLoadingStore = create((set) => ({
  isLoading: false,
  loadingText: "로딩 중...",

  showLoading: (text = "로딩 중...") => set({ isLoading: true, loadingText: text }),
  hideLoading: () => set({ isLoading: false, loadingText: "로딩 중..." }),
}));

export default useLoadingStore; 