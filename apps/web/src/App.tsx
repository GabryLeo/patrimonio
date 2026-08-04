import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { useMe } from './hooks/useAuth'
import { useAuthStore } from './store/authStore'

export default function App() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated)
  useMe()

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-sm text-muted-foreground">
        Carregando...
      </div>
    )
  }

  return <RouterProvider router={router} />
}
