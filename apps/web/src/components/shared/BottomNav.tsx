import { NavLink } from 'react-router-dom'
import { Clock3, FolderOpen, Home, MoreHorizontal, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUIStore } from '@/store/uiStore'

const navItems = [
  { to: '/', icon: Home, label: 'Início', exact: true },
  { to: '/timeline', icon: Clock3, label: 'Linha do tempo' },
  { to: '/files', icon: FolderOpen, label: 'Arquivos' },
  { to: '/more', icon: MoreHorizontal, label: 'Mais' },
]

export function BottomNav() {
  const setAddSheetOpen = useUIStore((s) => s.setAddSheetOpen)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-2">
        {navItems.slice(0, 2).map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <button
          onClick={() => setAddSheetOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
          aria-label="Adicionar"
        >
          <Plus className="h-6 w-6" />
        </button>

        {navItems.slice(2).map((item) => (
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
        cn(
          'flex w-16 flex-col items-center gap-1 rounded-xl px-1 py-1 transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn('h-5 w-5', isActive && 'fill-current')} />
          <span className="text-center text-[10px] font-medium leading-none">{label}</span>
        </>
      )}
    </NavLink>
  )
}
