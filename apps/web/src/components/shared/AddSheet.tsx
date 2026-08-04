import { useLocation, useNavigate } from 'react-router-dom'
import { Building2, DollarSign, FileUp, Star } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useUIStore } from '@/store/uiStore'

const addOptions = [
  {
    icon: DollarSign,
    label: 'Novo lançamento',
    description: 'Registro financeiro + comprovante',
    color: 'bg-green-100 text-green-700',
    sub: 'financial',
  },
  {
    icon: Star,
    label: 'Nova memória',
    description: 'Momentos especiais',
    color: 'bg-yellow-100 text-yellow-700',
    sub: 'timeline',
  },
  {
    icon: FileUp,
    label: 'Novo arquivo',
    description: 'Foto, documento, contrato...',
    color: 'bg-blue-100 text-blue-700',
    sub: 'documents',
  },
  {
    icon: Building2,
    label: 'Novo patrimônio',
    description: 'Criar base para próximos lançamentos',
    color: 'bg-slate-100 text-slate-700',
    sub: 'asset',
  },
]

export function AddSheet() {
  const { addSheetOpen, setAddSheetOpen, setAssetDialogOpen } = useUIStore()
  const location = useLocation()
  const navigate = useNavigate()

  const assetMatch = location.pathname.match(/\/assets\/([^/]+)/)
  const assetId = assetMatch?.[1]

  function handleOption(sub: string) {
    setAddSheetOpen(false)

    if (sub === 'asset') {
      setAssetDialogOpen(true)
      return
    }

    if (!assetId) {
      navigate('/')
      return
    }

    navigate(`/assets/${assetId}/${sub}`)
  }

  return (
    <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
      <SheetContent side="bottom" className="pb-8">
        <SheetHeader className="mb-4">
          <SheetTitle>O que deseja adicionar?</SheetTitle>
          {!assetId && (
            <p className="text-xs text-muted-foreground">
              Novo patrimônio funciona de qualquer tela. Outros itens usam patrimônio atual.
            </p>
          )}
        </SheetHeader>
        <div className="grid grid-cols-1 gap-2">
          {addOptions.map((option) => (
            <button
              key={option.label}
              onClick={() => handleOption(option.sub)}
              className="flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors hover:bg-accent active:scale-[0.99]"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${option.color}`}>
                <option.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
