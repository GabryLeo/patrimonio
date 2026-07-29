import { formatCurrency, formatDate } from '@/lib/formatters'
import { useDashboard } from '@/hooks/useDashboard'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useNavigate } from 'react-router-dom'
import { ASSET_TYPE_LABELS } from '@patrimonio/shared'
import { TrendingUp, Building2, Car, ChevronRight, Calendar } from 'lucide-react'

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading } = useDashboard()
  const navigate = useNavigate()

  const greeting = getGreeting()

  return (
    <div className="px-4 pt-8 pb-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-muted-foreground text-sm">{greeting}</p>
        <h1 className="text-2xl font-bold">{user?.name?.split(' ')[0] ?? 'Olá'} 👋</h1>
      </div>

      {/* Stats Row */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 bg-primary text-primary-foreground">
            <CardContent className="p-4">
              <p className="text-xs font-medium opacity-70 mb-1">Patrimônio Total</p>
              <p className="text-xl font-bold">{formatCurrency(data?.totalInvested ?? 0)}</p>
              <p className="text-xs opacity-60 mt-1">{data?.totalAssets ?? 0} bens</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Este Mês</p>
              <p className="text-xl font-bold">{formatCurrency(data?.monthTotal ?? 0)}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">investido</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assets */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Meus Patrimônios</h2>
          <button onClick={() => navigate('/assets')} className="text-xs text-primary font-medium">Ver todos</button>
        </div>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : (
          <div className="space-y-2">
            {data?.assets?.slice(0, 4).map((asset: any) => (
              <button
                key={asset.id}
                onClick={() => navigate(`/assets/${asset.id}`)}
                className="w-full"
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary flex-shrink-0">
                      <AssetIcon type={asset.type} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm">{asset.name}</p>
                      <p className="text-xs text-muted-foreground">{ASSET_TYPE_LABELS[asset.type as keyof typeof ASSET_TYPE_LABELS]}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(asset.totalInvested)}</p>
                      <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
            {(!data?.assets || data.assets.length === 0) && (
              <Card className="border-dashed">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground text-sm">Nenhum patrimônio cadastrado</p>
                  <button onClick={() => navigate('/assets')} className="text-primary text-sm font-medium mt-2 block">
                    Adicionar primeiro bem →
                  </button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </section>

      {/* Next Payments */}
      {data?.nextPayments?.length > 0 && (
        <section>
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Próximos Pagamentos</h2>
          <div className="space-y-2">
            {data.nextPayments.map((payment: any) => (
              <Card key={payment.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{payment.title}</p>
                    <p className="text-xs text-muted-foreground">{payment.asset?.name} · {formatDate(payment.eventDate)}</p>
                  </div>
                  <p className="font-semibold text-sm">{formatCurrency(Number(payment.amount))}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function AssetIcon({ type }: { type: string }) {
  switch (type) {
    case 'APARTMENT':
    case 'HOUSE':
    case 'COMMERCIAL': return <Building2 className="h-5 w-5" />
    case 'CAR':
    case 'MOTORCYCLE': return <Car className="h-5 w-5" />
    default: return <Building2 className="h-5 w-5" />
  }
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}
