import { create } from "zustand";
import type { TBusiness } from "@shared/types";

type BusinessState = {
  activeBusiness: TBusiness | null;
  setActiveBusiness: (business: TBusiness | null) => void;
};

export const useBusinessStore = create<BusinessState>((set) => ({
  activeBusiness: null,
  setActiveBusiness: (business) => set({ activeBusiness: business }),
}));
