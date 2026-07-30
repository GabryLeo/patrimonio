import { NavLink } from 'react-router-dom'
import { Home, LayoutGrid, Plus, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUIStore } from '@/store/uiStore'

const navItems = [
  { to: '/', icon: Home, label: 'Início', exact: true },
  { to: '/assets', icon: LayoutGrid, label: 'Patrimônios' },
  { to: '/more', icon: MoreHorizontal, label: 'Mais' },
]

export function BottomNav() {
  const setAddSheetOpen = useUIStore((s) => s.setAddSheetOpen)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-around px-2 max-w-lg mx-auto">
        {navItems.slice(0, 1).map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        {/* Botão central Add */}
        <button
          onClick={() => setAddSheetOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
        >
          <Plus className="h-6 w-6" />
        </button>

        {navItems.slice(1).map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </nav>
  )
}

function NavItem({ to, icon: Icon, label, exact }: { to: string; icon: React.ElementType; label: string; exact?: boolean }) {
  return (
    <NavLink
      to={to}
      end={exact}
      className={({ isActive }) =>
        cn('flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors', isActive ? 'text-primary' : 'text-muted-foreground')
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn('h-5 w-5', isActive && 'fill-current')} />
          <span className="text-[10px] font-medium">{label}</span>
        </>
      )}
    </NavLink>
  )
}
