import { create } from "zustand";

interface PinStore {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

export const usePinStore = create<PinStore>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));
