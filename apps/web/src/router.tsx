import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { AppLayout } from './components/shared/AppLayout'
import AssetDocumentsPage from './pages/assets/AssetDocumentsPage'
import AssetFinancialPage from './pages/assets/AssetFinancialPage'
import AssetsListPage from './pages/assets/AssetsListPage'
import AssetOverviewPage from './pages/assets/AssetOverviewPage'
import AssetTimelinePage from './pages/assets/AssetTimelinePage'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import FilesPage from './pages/files/FilesPage'
import MorePage from './pages/more/MorePage'
import TimelinePage from './pages/timeline/TimelinePage'
import { useAuthStore } from './store/authStore'

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const authChecked = useAuthStore((s) => s.authChecked)

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Carregando...
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/assets', element: <AssetsListPage /> },
          { path: '/assets/:id', element: <AssetOverviewPage /> },
          { path: '/assets/:id/financial', element: <AssetFinancialPage /> },
          { path: '/assets/:id/timeline', element: <AssetTimelinePage /> },
          { path: '/assets/:id/documents', element: <AssetDocumentsPage /> },
          { path: '/timeline', element: <TimelinePage /> },
          { path: '/files', element: <FilesPage /> },
          { path: '/more', element: <MorePage /> },
        ],
      },
    ],
  },
])
