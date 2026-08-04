import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { ASSET_TYPE_LABELS, type CreateAssetInput } from '@patrimonio/shared'
import { useCreateAsset } from '@/hooks/useAssets'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const assetTypes = Object.entries(ASSET_TYPE_LABELS) as [string, string][]

const FormSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100),
  type: z.enum(['APARTMENT', 'HOUSE', 'CAR', 'LAND', 'COMMERCIAL', 'MOTORCYCLE', 'BOAT', 'OTHER'], {
    required_error: 'Tipo obrigatório',
  }),
  totalValue: z
    .number({ required_error: 'Valor obrigatório', invalid_type_error: 'Informe um valor válido' })
    .min(0.01, 'Valor mínimo R$ 0,01'),
  acquisitionDate: z.string().optional(),
  isFinanced: z.boolean().optional(),
  financingBank: z.string().max(200).optional(),
})

type FormValues = z.infer<typeof FormSchema>

export function AssetCreateDialog() {
  const navigate = useNavigate()
  const createAsset = useCreateAsset()
  const { assetDialogOpen, setAssetDialogOpen } = useUIStore()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  })

  const isFinanced = watch('isFinanced')

  async function onSubmit(data: FormValues) {
    const { isFinanced, financingBank, ...rest } = data
    const payload: CreateAssetInput = {
      ...rest,
      description: isFinanced && financingBank ? financingBank : undefined,
    }

    const asset = await createAsset.mutateAsync(payload)
    reset()
    setAssetDialogOpen(false)
    navigate(`/assets/${asset.id}`)
  }

  function handleOpenChange(open: boolean) {
    setAssetDialogOpen(open)
    if (!open) reset()
  }

  return (
    <Dialog open={assetDialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo patrimônio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input placeholder="Ex: Apartamento Centro" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select onValueChange={(value) => setValue('type', value as FormValues['type'])}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione tipo" />
              </SelectTrigger>
              <SelectContent>
                {assetTypes.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Valor de compra (R$)</Label>
            <Input type="number" step="0.01" min="0.01" placeholder="0,00" {...register('totalValue', { valueAsNumber: true })} />
            {errors.totalValue && <p className="text-xs text-destructive">{errors.totalValue.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Data da compra</Label>
            <Input type="date" {...register('acquisitionDate')} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="asset-is-financed" className="h-4 w-4 rounded border-border" {...register('isFinanced')} />
            <Label htmlFor="asset-is-financed">É financiado?</Label>
          </div>
          {isFinanced && (
            <div className="space-y-2">
              <Label>Banco / financiadora</Label>
              <Input placeholder="Ex: Caixa, Itaú..." {...register('financingBank')} />
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={createAsset.isPending}>
              {createAsset.isPending ? 'Criando...' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
