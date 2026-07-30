import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Pencil, Trash2, Paperclip } from 'lucide-react'
import { useFinancial, useCreateFinancial, useUpdateFinancial, useDeleteFinancial } from '@/hooks/useFinancial'
import { useUpload } from '@/hooks/useUpload'
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

type Mode = 'create' | 'edit'

export default function AssetFinancialPage() {
  const { id } = useParams<{ id: string }>()
  const { data: asset } = useAsset(id!)
  const { data: records, isLoading } = useFinancial(id!)
  const createFinancial = useCreateFinancial(id!)
  const updateFinancial = useUpdateFinancial(id!)
  const deleteFinancial = useDeleteFinancial(id!)
  const upload = useUpload({})

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('create')
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<CreateFinancialRecordInput>({
    resolver: zodResolver(CreateFinancialRecordSchema),
  })

  function openCreate() {
    setMode('create')
    setEditingRecord(null)
    setSelectedFile(null)
    reset()
    setOpen(true)
  }

  function openEdit(record: any) {
    setMode('edit')
    setEditingRecord(record)
    setSelectedFile(null)
    setValue('title', record.title)
    setValue('amount', Number(record.amount))
    setValue('eventDate', record.eventDate?.slice(0, 10))
    setValue('notes', record.notes ?? '')
    if (record.categoryId) setValue('categoryId', record.categoryId)
    setOpen(true)
  }

  async function onSubmit(data: CreateFinancialRecordInput) {
    try {
      if (mode === 'create') {
        const record = await createFinancial.mutateAsync(data)
        if (selectedFile) {
          await upload.mutateAsync({ file: selectedFile, options: { financialRecordId: record.id } })
        }
      } else {
        await updateFinancial.mutateAsync({ id: editingRecord.id, data })
      }
      reset()
      setSelectedFile(null)
      setOpen(false)
    } catch {
      // errors shown via mutation.isError
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  const total = records?.reduce((sum: number, r: any) => sum + Number(r.amount), 0) ?? 0
  const hasCategories = (asset?.categories?.length ?? 0) > 0

  return (
    <div className="px-4 pt-6 pb-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">Financeiro</h2>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Novo
        </Button>
      </div>

      <p className="text-muted-foreground text-sm mb-4">{asset?.name}</p>

      <Card className="border-0 bg-primary text-primary-foreground mb-6">
        <CardContent className="p-5 flex justify-between items-center">
          <div>
            <p className="text-sm opacity-70">Total investido</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(total)}</p>
          </div>
          <p className="text-sm opacity-60">{records?.length ?? 0} registros</p>
        </CardContent>
      </Card>

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
                    <div className="h-3 w-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: record.category.color }} />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{record.title}</p>
                        {record.category && (
                          <span className="inline-block text-xs px-2 py-0.5 rounded-full mt-1" style={{ backgroundColor: record.category.color + '20', color: record.category.color }}>
                            {record.category.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <p className="font-bold text-sm">{formatCurrency(Number(record.amount))}</p>
                        <button onClick={() => openEdit(record)} className="text-muted-foreground hover:text-foreground p-1">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => { if (confirm('Apagar este registro?')) deleteFinancial.mutate(record.id) }}
                          className="text-muted-foreground hover:text-destructive p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
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
              <Button variant="outline" size="sm" onClick={openCreate}>Adicionar primeiro</Button>
            </div>
          )}
        </div>
      )}

      <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={handleFileSelect} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Novo Lançamento' : 'Editar Lançamento'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Conta</Label>
              <Select
                defaultValue={editingRecord?.categoryId ?? '__none__'}
                onValueChange={(v) => setValue('categoryId', v === '__none__' ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sem categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sem categoria</SelectItem>
                  {!hasCategories ? (
                    <p className="px-2 py-3 text-xs text-muted-foreground text-center">
                      Crie uma conta primeiro na página do patrimônio
                    </p>
                  ) : (
                    asset?.categories?.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))
                  )}
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
              <Input type="number" step="0.01" min="0.01" placeholder="0,00" {...register('amount', { valueAsNumber: true })} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" {...register('eventDate')} />
              {errors.eventDate && <p className="text-xs text-destructive">{errors.eventDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea placeholder="Notas adicionais..." {...register('notes')} rows={2} />
            </div>

            {mode === 'create' && (
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Paperclip className="h-4 w-4" />
                  {selectedFile ? selectedFile.name : 'Anexar comprovante (opcional)'}
                </button>
                {selectedFile && (
                  <button type="button" onClick={() => setSelectedFile(null)} className="text-xs text-destructive mt-1">
                    Remover
                  </button>
                )}
              </div>
            )}

            {(createFinancial.isError || updateFinancial.isError) && (
              <p className="text-xs text-destructive text-center">Erro ao salvar. Tente novamente.</p>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" className="flex-1" disabled={createFinancial.isPending || updateFinancial.isPending || upload.isPending}>
                {createFinancial.isPending || updateFinancial.isPending ? 'Salvando...' : upload.isPending ? 'Enviando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
