import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { AppLayout } from './components/shared/AppLayout'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import AssetsListPage from './pages/assets/AssetsListPage'
import AssetOverviewPage from './pages/assets/AssetOverviewPage'
import AssetFinancialPage from './pages/assets/AssetFinancialPage'
import AssetTimelinePage from './pages/assets/AssetTimelinePage'
import AssetDocumentsPage from './pages/assets/AssetDocumentsPage'

function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
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
        ],
      },
    ],
  },
])
