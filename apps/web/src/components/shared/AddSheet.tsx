import { DollarSign, FileText, Image, Star, CheckSquare } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useUIStore } from '@/store/uiStore'

const addOptions = [
  { icon: DollarSign, label: 'Registro Financeiro', description: 'Pagamento, parcela, compra', color: 'bg-green-100 text-green-700', path: 'financial/new' },
  { icon: FileText, label: 'Documento', description: 'PDF, contrato, nota fiscal', color: 'bg-blue-100 text-blue-700', path: 'documents/new' },
  { icon: Image, label: 'Foto', description: 'Fotos do imóvel, bem ou evento', color: 'bg-purple-100 text-purple-700', path: 'photos/new' },
  { icon: Star, label: 'Memória', description: 'Momentos especiais', color: 'bg-yellow-100 text-yellow-700', path: 'memories/new' },
  { icon: CheckSquare, label: 'Checklist', description: 'Lista de tarefas', color: 'bg-orange-100 text-orange-700', path: 'checklists/new' },
]

export function AddSheet() {
  const { addSheetOpen, setAddSheetOpen } = useUIStore()

  return (
    <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
      <SheetContent side="bottom" className="pb-8">
        <SheetHeader className="mb-6">
          <SheetTitle>O que deseja adicionar?</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-1 gap-2">
          {addOptions.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                setAddSheetOpen(false)
                // Navigate to current asset's sub-route
              }}
              className="flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors hover:bg-accent active:scale-[0.99]"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${opt.color}`}>
                <opt.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{opt.label}</p>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </div>
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
