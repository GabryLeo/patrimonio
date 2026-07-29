import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'
import { AddSheet } from './AddSheet'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20 max-w-2xl mx-auto">
        <Outlet />
      </main>
      <BottomNav />
      <AddSheet />
    </div>
  )
}
