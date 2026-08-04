import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@patrimonio/shared'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  hasHydrated: boolean
  authChecked: boolean
  setUser: (user: User | null) => void
  setAuthChecked: (checked: boolean) => void
  setHasHydrated: (hydrated: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      authChecked: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setAuthChecked: (authChecked) => set({ authChecked }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      logout: () => set({ user: null, isAuthenticated: false, authChecked: true }),
    }),
    {
      name: 'patrimonio-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
