import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Building2, Car, MapPin, Anchor } from 'lucide-react'
import { useAssets, useCreateAsset } from '@/hooks/useAssets'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ASSET_TYPE_LABELS } from '@patrimonio/shared'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateAssetSchema, type CreateAssetInput } from '@patrimonio/shared'

const assetTypes = Object.entries(ASSET_TYPE_LABELS) as [string, string][]

export default function AssetsListPage() {
  const navigate = useNavigate()
  const { data: assets, isLoading } = useAssets()
  const createAsset = useCreateAsset()
  const [open, setOpen] = useState(false)

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<CreateAssetInput>({
    resolver: zodResolver(CreateAssetSchema),
  })

  async function onSubmit(data: CreateAssetInput) {
    const asset = await createAsset.mutateAsync(data)
    reset()
    setOpen(false)
    navigate(`/assets/${asset.id}`)
  }

  return (
    <div className="px-4 pt-8 pb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Patrimônios</h1>
          <p className="text-muted-foreground text-sm">{assets?.length ?? 0} bens cadastrados</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Novo
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {assets?.map((asset: any) => (
            <button key={asset.id} onClick={() => navigate(`/assets/${asset.id}`)} className="w-full">
              <Card className="hover:shadow-md transition-all active:scale-[0.99]">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary flex-shrink-0">
                    <AssetIcon type={asset.type} className="h-6 w-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">{asset.name}</p>
                    <p className="text-sm text-muted-foreground">{ASSET_TYPE_LABELS[asset.type as keyof typeof ASSET_TYPE_LABELS]}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{asset.categories?.length ?? 0} categorias</p>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700">
                      {asset.status === 'ACTIVE' ? 'Ativo' : asset.status === 'SOLD' ? 'Vendido' : 'Arquivado'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
          {assets?.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-muted-foreground mb-3">Nenhum patrimônio ainda</p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar primeiro bem
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Patrimônio</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input placeholder="Ex: Apartamento Centro" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select onValueChange={(v) => setValue('type', v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Valor Total (opcional)</Label>
              <Input
                type="number"
                placeholder="0,00"
                {...register('totalValue', { valueAsNumber: true })}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1" disabled={createAsset.isPending}>
                {createAsset.isPending ? 'Criando...' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AssetIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case 'CAR': case 'MOTORCYCLE': return <Car className={className} />
    case 'LAND': return <MapPin className={className} />
    case 'BOAT': return <Anchor className={className} />
    default: return <Building2 className={className} />
  }
}
