import { create } from "zustand";
import type { PinWithSnippet } from "@/lib/requests/PinRequests";

interface ModalStore {
  editPin: PinWithSnippet | null;
  openEditPin: (pin: PinWithSnippet) => void;
  closeEditPin: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  editPin: null,
  openEditPin: (pin) => set({ editPin: pin }),
  closeEditPin: () => set({ editPin: null }),
}));
