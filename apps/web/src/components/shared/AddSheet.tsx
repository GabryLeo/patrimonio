import { useLocation, useNavigate } from 'react-router-dom'
import { Building2, DollarSign, FileUp, Star } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useUIStore } from '@/store/uiStore'
import { useAssets } from '@/hooks/useAssets'

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
  const { data: assets = [] } = useAssets()

  const assetMatch = location.pathname.match(/\/assets\/([^/]+)/)
  const assetId = assetMatch?.[1]
  const currentAsset = assets.find((asset: any) => asset.id === assetId)

  function handleOption(sub: string, selectedAssetId?: string) {
    setAddSheetOpen(false)

    if (sub === 'asset') {
      setAssetDialogOpen(true)
      return
    }

    navigate(`/assets/${selectedAssetId ?? assetId}/${sub}`)
  }

  return (
    <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
      <SheetContent side="bottom" className="pb-8">
        <SheetHeader className="mb-4">
          <SheetTitle>O que deseja adicionar?</SheetTitle>
          <p className="text-xs text-muted-foreground">
            {assetId
              ? `Patrimônio atual: ${currentAsset?.name ?? 'selecionado'}.`
              : 'Escolha um patrimônio para continuar antes de criar lançamento, memória ou arquivo.'}
          </p>
        </SheetHeader>

        <div className="grid grid-cols-1 gap-2">
          {addOptions.map((option) => (
            <div key={option.label} className="rounded-2xl border p-3">
              <button
                onClick={() => (option.sub === 'asset' || assetId ? handleOption(option.sub) : undefined)}
                className="flex w-full items-center gap-4 text-left"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${option.color}`}>
                  <option.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </button>

              {!assetId && option.sub !== 'asset' && (
                <div className="mt-3 space-y-2 border-t pt-3">
                  {assets.length === 0 ? (
                    <div className="rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                      Nenhum patrimônio cadastrado ainda. Crie o primeiro para adicionar lançamentos, memórias e arquivos.
                    </div>
                  ) : (
                    assets.map((asset: any) => (
                      <button
                        key={asset.id}
                        onClick={() => handleOption(option.sub, asset.id)}
                        className="flex w-full items-center justify-between rounded-xl bg-secondary/60 px-3 py-2 text-left text-sm transition-colors hover:bg-secondary"
                      >
                        <span>{asset.name}</span>
                        <span className="text-xs text-muted-foreground">Escolher</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
