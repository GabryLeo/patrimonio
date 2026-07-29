import { useParams, useNavigate, NavLink } from 'react-router-dom'
import { ArrowLeft, DollarSign, Clock, FileText } from 'lucide-react'
import { useAsset } from '@/hooks/useAssets'
import { useFinancial } from '@/hooks/useFinancial'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ASSET_TYPE_LABELS } from '@patrimonio/shared'

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

  const totalInvested = records?.reduce((sum: number, r: any) => sum + Number(r.amount), 0) ?? 0

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
      {/* Header */}
      <div className="px-4 pt-6 mb-4">
        <button onClick={() => navigate('/assets')} className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
          <ArrowLeft className="h-4 w-4" />
          Patrimônios
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{asset.name}</h1>
            <p className="text-muted-foreground text-sm">{ASSET_TYPE_LABELS[asset.type as keyof typeof ASSET_TYPE_LABELS]}</p>
          </div>
          <Badge variant={asset.status === 'ACTIVE' ? 'default' : 'secondary'}>
            {asset.status === 'ACTIVE' ? 'Ativo' : asset.status === 'SOLD' ? 'Vendido' : 'Arquivado'}
          </Badge>
        </div>
      </div>

      {/* Cover / Stats */}
      <div className="px-4">
        <Card className="border-0 bg-primary text-primary-foreground mb-4">
          <CardContent className="p-6">
            <p className="text-sm opacity-70 mb-1">Total Investido</p>
            <p className="text-3xl font-bold">{formatCurrency(totalInvested)}</p>
            {asset.acquisitionDate && (
              <p className="text-sm opacity-60 mt-2">Desde {formatDate(asset.acquisitionDate)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="px-4 grid grid-cols-3 gap-2 mb-6">
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold">{records?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Registros</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold">{asset.categories?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Categorias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <p className="text-lg font-bold">{(asset as any)._count?.attachments ?? 0}</p>
            <p className="text-xs text-muted-foreground">Arquivos</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="px-4 mb-6">
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

      {/* Recent Records */}
      <div className="px-4">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Últimos Registros</h3>
        <div className="space-y-2">
          {records?.slice(0, 5).map((record: any) => (
            <Card key={record.id}>
              <CardContent className="p-4 flex items-center gap-3">
                {record.category && (
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: record.category.color }}
                  />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{record.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(record.eventDate)}</p>
                </div>
                <p className="font-semibold text-sm">{formatCurrency(Number(record.amount))}</p>
              </CardContent>
            </Card>
          ))}
          {(!records || records.length === 0) && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center text-muted-foreground text-sm">
                Nenhum registro ainda
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
