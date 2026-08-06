import { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams, useNavigate, NavLink } from 'react-router-dom'
import { ArrowLeft, DollarSign, Clock, FileText, Plus, Trash2, Pencil } from 'lucide-react'
import { useAsset, useUpdateAsset, useDeleteAsset } from '@/hooks/useAssets'
import { useFinancial } from '@/hooks/useFinancial'
import { useCategories, useCreateCategory, useDeleteCategory } from '@/hooks/useCategories'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ASSET_TYPE_LABELS } from '@patrimonio/shared'
import { cn } from '@/lib/cn'
import { buildAssetMetrics } from '@/lib/assetMetrics'
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/currencyInput'

const PRESET_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280']
const ASSET_TYPE_KEYS = Object.keys(ASSET_TYPE_LABELS) as (keyof typeof ASSET_TYPE_LABELS)[]

const tabs = [
  { label: 'Financeiro', path: 'financial', icon: DollarSign },
  { label: 'Timeline', path: 'timeline', icon: Clock },
  { label: 'Docs', path: 'documents', icon: FileText },
]

export default function AssetOverviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: asset, isLoading } = useAsset(id!)
  const { data: records } = useFinancial(id!)
  const { data: categories } = useCategories(id!)
  const createCategory = useCreateCategory(id!)
  const deleteCategory = useDeleteCategory(id!)
  const updateAsset = useUpdateAsset(id!)
  const deleteAsset = useDeleteAsset()

  const [catDialogOpen, setCatDialogOpen] = useState(false)
  const [catName, setCatName] = useState('')
  const [catColor, setCatColor] = useState(PRESET_COLORS[0])

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('')
  const [editValue, setEditValue] = useState('')
  const [editDate, setEditDate] = useState('')

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const metrics = buildAssetMetrics(Number(asset?.totalValue ?? 0), records ?? [])
  const [editError, setEditError] = useState('')

  const categoryTotals = records?.reduce((acc: Record<string, number>, r: any) => {
    const key = r.categoryId ?? '__outros__'
    acc[key] = (acc[key] ?? 0) + Number(r.amount)
    return acc
  }, {}) ?? {}

  async function handleCreateCategory() {
    if (!catName.trim()) return
    await createCategory.mutateAsync({ name: catName.trim(), color: catColor })
    setCatName('')
    setCatColor(PRESET_COLORS[0])
    setCatDialogOpen(false)
  }

  function openEdit() {
    setEditName(asset?.name ?? '')
    setEditType(asset?.type ?? '')
    setEditValue(asset?.totalValue ? formatCurrencyInput(String(Math.round(Number(asset.totalValue) * 100))) : '')
    setEditDate(asset?.acquisitionDate ? asset.acquisitionDate.slice(0, 10) : '')
    setEditError('')
    setEditDialogOpen(true)
  }

  useEffect(() => {
    if (!editDialogOpen) {
      setEditValue('')
    }
  }, [editDialogOpen])

  async function handleEditSave() {
    try {
      setEditError('')
      await updateAsset.mutateAsync({
        name: editName || undefined,
        type: editType as any || undefined,
        totalValue: editValue ? parseCurrencyInput(editValue) : undefined,
        acquisitionDate: editDate || undefined,
      })
      setEditDialogOpen(false)
    } catch (error) {
      setEditError(axios.isAxiosError(error) ? error.response?.data?.error ?? 'Erro ao salvar patrimônio' : 'Erro ao salvar patrimônio')
    }
  }

  async function handleDelete() {
    await deleteAsset.mutateAsync(id!)
    navigate('/assets')
  }

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 pt-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-24" />
      </div>
    )
  }

  if (!asset) return null

  return (
    <div className="pb-6">
      <div className="mb-4 px-4 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => navigate('/assets')} className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Patrimônios
          </button>
          <div className="flex items-center gap-2">
            <button onClick={openEdit} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => setDeleteDialogOpen(true)} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{asset.name}</h1>
            <Badge variant="outline" className="mt-1">
              {ASSET_TYPE_LABELS[asset.type as keyof typeof ASSET_TYPE_LABELS]}
            </Badge>
          </div>
          <Badge variant={asset.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {asset.status === 'ACTIVE' ? 'Ativo' : asset.status === 'SOLD' ? 'Vendido' : 'Arquivado'}
          </Badge>
        </div>
      </div>

      <div className="mb-6 px-4">
        <Card className="border-0 bg-primary text-primary-foreground">
          <CardContent className="space-y-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm opacity-70">Valor fixo do patrimônio</p>
                <p className="mt-1 text-2xl font-bold">
                  {asset.totalValue ? formatCurrency(Number(asset.totalValue)) : '—'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-70">Total pago</p>
                <p className="mt-1 text-xl font-bold">{formatCurrency(metrics.totalPaid)}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <MetricCard label="Quitado até o valor" value={formatCurrency(metrics.settledAmount)} />
              <MetricCard label="Excedente" value={formatCurrency(metrics.overageAmount)} />
              <MetricCard label="Saldo" value={formatCurrency(metrics.remainingBalance)} />
            </div>
            {asset.acquisitionDate && <p className="text-xs opacity-60">Desde {formatDate(asset.acquisitionDate)}</p>}
            {asset.description && <p className="text-xs opacity-60">Financiadora: {asset.description}</p>}
          </CardContent>
        </Card>
      </div>

      <div className="mb-6 px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Contas</h2>
          <Button size="sm" variant="outline" onClick={() => setCatDialogOpen(true)}>
            <Plus className="mr-1 h-3.5 w-3.5" />
            Nova conta
          </Button>
        </div>
        <div className="space-y-2">
          {categories?.map((cat: any) => (
            <Card key={cat.id} className="transition-shadow hover:shadow-sm">
              <CardContent className="flex cursor-pointer items-center gap-3 p-4" onClick={() => navigate(`/assets/${id}/financial`)}>
                <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
                <p className="flex-1 text-sm font-medium">{cat.name}</p>
                <p className="text-sm font-bold">{formatCurrency(categoryTotals[cat.id] ?? 0)}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteCategory.mutate(cat.id)
                  }}
                  className="flex-shrink-0 p-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </CardContent>
            </Card>
          ))}
          {categoryTotals.__outros__ !== undefined && (
            <Card className="transition-shadow hover:shadow-sm">
              <CardContent className="flex cursor-pointer items-center gap-3 p-4" onClick={() => navigate(`/assets/${id}/financial`)}>
                <div className="h-3 w-3 flex-shrink-0 rounded-full bg-muted-foreground/40" />
                <p className="flex-1 text-sm font-medium text-muted-foreground">Outros</p>
                <p className="text-sm font-bold">{formatCurrency(categoryTotals.__outros__)}</p>
              </CardContent>
            </Card>
          )}
          {(!categories || categories.length === 0) && categoryTotals.__outros__ === undefined && (
            <button
              onClick={() => setCatDialogOpen(true)}
              className="w-full rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground transition-colors hover:bg-accent"
            >
              Crie contas para organizar seus registros financeiros
            </button>
          )}
        </div>
      </div>

      <div className="px-4">
        <div className="flex gap-2 rounded-xl bg-secondary p-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={`/assets/${id}/${tab.path}`}
              className={({ isActive }) =>
                `flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
                }`
              }
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Conta</DialogTitle></DialogHeader>
          <div className="mt-2 space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input placeholder="Ex: Financiamento, Manutenção..." value={catName} onChange={(e) => setCatName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCatColor(color)}
                    className={cn('h-8 w-8 rounded-full transition-all', catColor === color ? 'scale-110 ring-2 ring-foreground ring-offset-2' : '')}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setCatName(''); setCatDialogOpen(false) }}>Cancelar</Button>
              <Button className="flex-1" disabled={!catName.trim() || createCategory.isPending} onClick={handleCreateCategory}>
                {createCategory.isPending ? 'Criando...' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Patrimônio</DialogTitle></DialogHeader>
          <div className="mt-2 space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={editType} onValueChange={setEditType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ASSET_TYPE_KEYS.map((key) => (
                    <SelectItem key={key} value={key}>{ASSET_TYPE_LABELS[key]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor de compra (R$)</Label>
              <Input inputMode="numeric" value={editValue} onChange={(e) => setEditValue(formatCurrencyInput(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Data da compra</Label>
              <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            </div>
            {editError ? <p className="text-center text-xs text-destructive">{editError}</p> : null}
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
              <Button className="flex-1" disabled={updateAsset.isPending} onClick={handleEditSave}>
                {updateAsset.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Apagar patrimônio?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Isso apagará <strong>{asset.name}</strong> e todos os registros, contas e arquivos vinculados. Essa ação não pode ser desfeita.</p>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" className="flex-1" disabled={deleteAsset.isPending} onClick={handleDelete}>
              {deleteAsset.isPending ? 'Apagando...' : 'Apagar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <p className="text-[11px] opacity-70">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}
