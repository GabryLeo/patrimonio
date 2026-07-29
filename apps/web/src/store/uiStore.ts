import { create } from 'zustand'

interface UIState {
  addSheetOpen: boolean
  setAddSheetOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  addSheetOpen: false,
  setAddSheetOpen: (open) => set({ addSheetOpen: open }),
}))
