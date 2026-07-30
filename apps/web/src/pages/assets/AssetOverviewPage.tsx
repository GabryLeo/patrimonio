import { useState } from 'react'
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

  const totalInvested = records?.reduce((sum: number, r: any) => sum + Number(r.amount), 0) ?? 0

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
    setEditValue(asset?.totalValue ? String(asset.totalValue) : '')
    setEditDate(asset?.acquisitionDate ? asset.acquisitionDate.slice(0, 10) : '')
    setEditDialogOpen(true)
  }

  async function handleEditSave() {
    await updateAsset.mutateAsync({
      name: editName || undefined,
      type: editType as any || undefined,
      totalValue: editValue ? parseFloat(editValue) : undefined,
      acquisitionDate: editDate || undefined,
    })
    setEditDialogOpen(false)
  }

  async function handleDelete() {
    await deleteAsset.mutateAsync(id!)
    navigate('/assets')
  }

  if (isLoading) {
    return (
      <div className="px-4 pt-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
        <Skeleton className="h-24" />
      </div>
    )
  }

  if (!asset) return null

  return (
    <div className="pb-6">
      <div className="px-4 pt-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/assets')} className="flex items-center gap-2 text-muted-foreground text-sm">
            <ArrowLeft className="h-4 w-4" />
            Patrimônios
          </button>
          <div className="flex items-center gap-2">
            <button onClick={openEdit} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => setDeleteDialogOpen(true)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-destructive">
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

      <div className="px-4 mb-6">
        <Card className="border-0 bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-sm opacity-70">Valor de compra</p>
                <p className="text-2xl font-bold mt-1">
                  {asset.totalValue ? formatCurrency(Number(asset.totalValue)) : '—'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-70">Total investido</p>
                <p className="text-xl font-bold mt-1">{formatCurrency(totalInvested)}</p>
              </div>
            </div>
            {asset.acquisitionDate && (
              <p className="text-xs opacity-60">Desde {formatDate(asset.acquisitionDate)}</p>
            )}
            {asset.description && (
              <p className="text-xs opacity-60 mt-1">Financiadora: {asset.description}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-base">Contas</h2>
          <Button size="sm" variant="outline" onClick={() => setCatDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Nova conta
          </Button>
        </div>
        <div className="space-y-2">
          {categories?.map((cat: any) => (
            <Card key={cat.id} className="hover:shadow-sm transition-shadow">
              <CardContent
                className="p-4 flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/assets/${id}/financial`)}
              >
                <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                <p className="flex-1 font-medium text-sm">{cat.name}</p>
                <p className="font-bold text-sm">{formatCurrency(categoryTotals[cat.id] ?? 0)}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteCategory.mutate(cat.id)
                  }}
                  className="text-muted-foreground hover:text-destructive p-1 flex-shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </CardContent>
            </Card>
          ))}
          {categoryTotals['__outros__'] !== undefined && (
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent
                className="p-4 flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/assets/${id}/financial`)}
              >
                <div className="h-3 w-3 rounded-full bg-muted-foreground/40 flex-shrink-0" />
                <p className="flex-1 font-medium text-sm text-muted-foreground">Outros</p>
                <p className="font-bold text-sm">{formatCurrency(categoryTotals['__outros__'])}</p>
              </CardContent>
            </Card>
          )}
          {(!categories || categories.length === 0) && categoryTotals['__outros__'] === undefined && (
            <button
              onClick={() => setCatDialogOpen(true)}
              className="w-full rounded-xl border border-dashed p-6 text-center text-muted-foreground text-sm hover:bg-accent transition-colors"
            >
              Crie contas para organizar seus registros financeiros
            </button>
          )}
        </div>
      </div>

      <div className="px-4">
        <div className="flex gap-2 p-1 bg-secondary rounded-xl">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={`/assets/${id}/${tab.path}`}
              className={({ isActive }) =>
                `flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                }`
              }
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Nova Conta Dialog */}
      <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Conta</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input placeholder="Ex: Financiamento, Manutenção..." value={catName} onChange={(e) => setCatName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button key={color} type="button" onClick={() => setCatColor(color)}
                    className={cn('h-8 w-8 rounded-full transition-all', catColor === color ? 'ring-2 ring-offset-2 ring-foreground scale-110' : '')}
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

      {/* Editar Patrimônio Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Patrimônio</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
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
              <Input type="number" step="0.01" value={editValue} onChange={(e) => setEditValue(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Data da compra</Label>
              <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
              <Button className="flex-1" disabled={updateAsset.isPending} onClick={handleEditSave}>
                {updateAsset.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmar exclusão Dialog */}
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
