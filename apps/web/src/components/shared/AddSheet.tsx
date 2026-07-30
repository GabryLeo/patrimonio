import { useLocation, useNavigate } from 'react-router-dom'
import { DollarSign, FileText, Image, Star, CheckSquare, Plus } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useUIStore } from '@/store/uiStore'

const addOptions = [
  { icon: DollarSign, label: 'Registro Financeiro', description: 'Pagamento, parcela, compra', color: 'bg-green-100 text-green-700', sub: 'financial' },
  { icon: FileText, label: 'Documento', description: 'PDF, contrato, nota fiscal', color: 'bg-blue-100 text-blue-700', sub: 'documents' },
  { icon: Image, label: 'Foto', description: 'Fotos do imóvel, bem ou evento', color: 'bg-purple-100 text-purple-700', sub: 'documents' },
  { icon: Star, label: 'Memória', description: 'Momentos especiais', color: 'bg-yellow-100 text-yellow-700', sub: 'timeline' },
  { icon: CheckSquare, label: 'Checklist', description: 'Lista de tarefas', color: 'bg-orange-100 text-orange-700', sub: '' },
]

export function AddSheet() {
  const { addSheetOpen, setAddSheetOpen } = useUIStore()
  const location = useLocation()
  const navigate = useNavigate()

  const assetMatch = location.pathname.match(/\/assets\/([^/]+)/)
  const assetId = assetMatch?.[1]

  function handleOption(sub: string) {
    setAddSheetOpen(false)
    if (!assetId) {
      navigate('/assets')
      return
    }
    if (sub) navigate(`/assets/${assetId}/${sub}`)
  }

  return (
    <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
      <SheetContent side="bottom" className="pb-8">
        <SheetHeader className="mb-4">
          <SheetTitle>O que deseja adicionar?</SheetTitle>
          {!assetId && (
            <p className="text-xs text-muted-foreground">Selecione um patrimônio primeiro para adicionar itens</p>
          )}
        </SheetHeader>
        <div className="grid grid-cols-1 gap-2">
          {addOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleOption(opt.sub)}
              className="flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors hover:bg-accent active:scale-[0.99]"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${opt.color}`}>
                <opt.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </div>
              {!assetId && <Plus className="h-4 w-4 text-muted-foreground rotate-45 opacity-40" />}
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
