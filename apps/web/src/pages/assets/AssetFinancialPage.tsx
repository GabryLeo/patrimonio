import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { useFinancial, useCreateFinancial } from '@/hooks/useFinancial'
import { useAsset } from '@/hooks/useAssets'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CreateFinancialRecordSchema, type CreateFinancialRecordInput } from '@patrimonio/shared'

export default function AssetFinancialPage() {
  const { id } = useParams<{ id: string }>()
  const { data: asset } = useAsset(id!)
  const { data: records, isLoading } = useFinancial(id!)
  const createFinancial = useCreateFinancial(id!)
  const [open, setOpen] = useState(false)

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<CreateFinancialRecordInput>({
    resolver: zodResolver(CreateFinancialRecordSchema),
  })

  async function onSubmit(data: CreateFinancialRecordInput) {
    await createFinancial.mutateAsync(data)
    reset()
    setOpen(false)
  }

  const total = records?.reduce((sum: number, r: any) => sum + Number(r.amount), 0) ?? 0

  return (
    <div className="px-4 pt-6 pb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">Financeiro</h2>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Novo
        </Button>
      </div>

      <p className="text-muted-foreground text-sm mb-4">{asset?.name}</p>

      {/* Total */}
      <Card className="border-0 bg-primary text-primary-foreground mb-6">
        <CardContent className="p-5 flex justify-between items-center">
          <div>
            <p className="text-sm opacity-70">Total investido</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(total)}</p>
          </div>
          <p className="text-sm opacity-60">{records?.length ?? 0} registros</p>
        </CardContent>
      </Card>

      {/* Records */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {records?.map((record: any) => (
            <Card key={record.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {record.category && (
                    <div
                      className="h-3 w-3 rounded-full mt-1.5 flex-shrink-0"
                      style={{ backgroundColor: record.category.color }}
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{record.title}</p>
                        {record.category && (
                          <span
                            className="inline-block text-xs px-2 py-0.5 rounded-full mt-1"
                            style={{ backgroundColor: record.category.color + '20', color: record.category.color }}
                          >
                            {record.category.name}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-sm">{formatCurrency(Number(record.amount))}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{formatDate(record.eventDate)}</p>
                    {record.notes && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{record.notes}</p>}
                    {record.attachments?.length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">📎 {record.attachments.length} arquivo(s)</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {records?.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-sm mb-3">Nenhum registro financeiro</p>
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>Adicionar primeiro</Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Registro</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select onValueChange={(v) => setValue('categoryId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {asset?.categories?.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input placeholder="Ex: Parcela 01/60" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input type="number" step="0.01" placeholder="0,00" {...register('amount', { valueAsNumber: true })} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Data do evento</Label>
              <Input type="date" {...register('eventDate')} />
              {errors.eventDate && <p className="text-xs text-destructive">{errors.eventDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea placeholder="Notas adicionais..." {...register('notes')} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1" disabled={createFinancial.isPending}>
                {createFinancial.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
