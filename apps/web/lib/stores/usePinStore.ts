import { create } from "zustand";

interface PinStore {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  view: "pins" | "places";
  setView: (view: "pins" | "places") => void;
}

export const usePinStore = create<PinStore>((set) => ({
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectedCategory: null,
  // Switching collection or view always resets the active search.
  setSelectedCategory: (category) =>
    set({ selectedCategory: category, searchQuery: "" }),
  view: "pins",
  setView: (view) => set({ view, searchQuery: "" }),
}));
