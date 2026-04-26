import { create } from "zustand";

interface PinStore {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const usePinStore = create<PinStore>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
