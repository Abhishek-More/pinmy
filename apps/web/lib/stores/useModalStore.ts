import { create } from "zustand";
import type { PinWithSnippet } from "@/lib/requests/PinRequests";

interface ModalStore {
  editPin: PinWithSnippet | null;
  openEditPin: (pin: PinWithSnippet) => void;
  closeEditPin: () => void;
  createPinOpen: boolean;
  openCreatePin: () => void;
  closeCreatePin: () => void;
  closeAll: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  editPin: null,
  openEditPin: (pin) => set({ editPin: pin }),
  closeEditPin: () => set({ editPin: null }),
  createPinOpen: false,
  openCreatePin: () => set({ createPinOpen: true }),
  closeCreatePin: () => set({ createPinOpen: false }),
  closeAll: () => set({ editPin: null, createPinOpen: false }),
}));
