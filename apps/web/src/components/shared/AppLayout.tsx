import { Outlet } from 'react-router-dom'
import { AddSheet } from './AddSheet'
import { AssetCreateDialog } from './AssetCreateDialog'
import { BottomNav } from './BottomNav'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--secondary))_0%,_hsl(var(--background))_55%)]">
      <main className="mx-auto max-w-2xl pb-20">
        <Outlet />
      </main>
      <BottomNav />
      <AddSheet />
      <AssetCreateDialog />
    </div>
  )
}
