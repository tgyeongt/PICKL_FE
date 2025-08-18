import { create } from "zustand";

const useConvertHelpSheetStore = create((set) => ({
  isOpen: false,
  setOpen: (v) => set({ isOpen: !!v }),
}));

export default useConvertHelpSheetStore;
