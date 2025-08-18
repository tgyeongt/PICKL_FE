import { create } from "zustand";

const useToastStore = create((set) => ({
  isOpen: false,
  message: "",
  type: "success",
  url: null,
  showToast: (message, type = "success", url = null) => set({ isOpen: true, message, type, url }),
  hideToast: () => set({ isOpen: false, message: "", url: null }),
}));

export default useToastStore;
