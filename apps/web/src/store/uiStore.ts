import { create } from 'zustand'

interface UIState {
  addSheetOpen: boolean
  assetDialogOpen: boolean
  setAddSheetOpen: (open: boolean) => void
  setAssetDialogOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  addSheetOpen: false,
  assetDialogOpen: false,
  setAddSheetOpen: (open) => set({ addSheetOpen: open }),
  setAssetDialogOpen: (open) => set({ assetDialogOpen: open }),
}))
