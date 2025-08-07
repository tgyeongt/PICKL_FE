import { atom } from "jotai";

export const selectedAddressAtom = atom({
  roadAddress: "",
  jibunAddress: "",
  lat: null,
  lng: null,
  isManual: false,
});
