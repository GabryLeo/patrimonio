import { useNavigate } from 'react-router-dom'
import { ArrowRight, BarChart3, CalendarClock, ChevronRight, PieChart, Plus, Wallet } from 'lucide-react'
import { useDashboard } from '@/hooks/useDashboard'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ASSET_TYPE_LABELS } from '@patrimonio/shared'

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const setAssetDialogOpen = useUIStore((s) => s.setAssetDialogOpen)
  const { data, isLoading } = useDashboard()

  const assets = data?.assets ?? []
  const hasAssets = assets.length > 0

  if (isLoading) {
    return (
      <div className="space-y-4 px-4 pb-6 pt-8">
        <Skeleton className="h-24 rounded-3xl" />
        <Skeleton className="h-28 rounded-3xl" />
        <Skeleton className="h-48 rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 pb-6 pt-8">
      <section className="space-y-2">
        <p className="text-sm text-muted-foreground">Olá, {user?.name?.split(' ')[0] ?? 'você'}</p>
        <div className="flex items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Início</h1>
            <p className="text-sm text-muted-foreground">Seus patrimônios e movimento recente em um só lugar.</p>
          </div>
          <Button size="sm" className="rounded-full" onClick={() => setAssetDialogOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </section>

      {!hasAssets ? (
        <EmptyHome onCreate={() => setAssetDialogOpen(true)} />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-3">
            <SummaryCard label="Patrimônio total" value={formatCurrency(data?.totalPatrimony ?? 0)} accent />
            <SummaryCard label="Total pago" value={formatCurrency(data?.totalPaid ?? 0)} />
            <SummaryCard label="Total investido" value={formatCurrency(data?.totalInvested ?? 0)} />
            <SummaryCard label="Saldo restante" value={formatCurrency(data?.remainingBalance ?? 0)} />
          </section>

          {(data?.totalOverage ?? 0) > 0 && (
            <Card className="border-0 bg-amber-50 shadow-sm">
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-semibold text-amber-900">Juros / excedente</p>
                  <p className="text-xs text-amber-800">Valor pago acima do valor fixo dos patrimônios.</p>
                </div>
                <p className="text-lg font-bold text-amber-900">{formatCurrency(data?.totalOverage ?? 0)}</p>
              </CardContent>
            </Card>
          )}

          <section className="space-y-3">
            <SectionHeader title="Patrimônios" actionLabel="Ver lista" onAction={() => navigate('/assets')} />
            <div className="space-y-3">
              {assets.map((asset: any) => (
                <button key={asset.id} onClick={() => navigate(`/assets/${asset.id}`)} className="w-full">
                  <Card className="overflow-hidden border-0 text-left shadow-sm">
                    <CardContent className="space-y-4 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-base font-semibold">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {ASSET_TYPE_LABELS[asset.type as keyof typeof ASSET_TYPE_LABELS]}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <Metric label="Valor" value={formatCurrency(asset.purchaseValue ?? 0)} />
                        <Metric label="Pago" value={formatCurrency(asset.totalPaid ?? 0)} />
                        <Metric label="Lançamentos" value={String(asset.recordsCount ?? 0)} />
                      </div>

                      {(asset.overageAmount ?? 0) > 0 && (
                        <div className="rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-900">
                          Excedente acumulado: <strong>{formatCurrency(asset.overageAmount ?? 0)}</strong>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Progresso pago</span>
                          <span>{Math.round(asset.progressPercent ?? 0)}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary">
                          <div
                            className="h-2 rounded-full bg-primary transition-[width]"
                            style={{ width: `${Math.min(asset.progressPercent ?? 0, 100)}%` }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-3 md:grid-cols-2">
            <MiniChartCard
              title="Gastos por categoria"
              icon={PieChart}
              rows={(data?.charts?.categoryTotals ?? []).slice(0, 4).map((item: any) => ({
                label: item.name,
                value: formatCurrency(item.total),
                color: item.color,
              }))}
            />
            <MiniChartCard
              title="Evolução mensal"
              icon={BarChart3}
              rows={(data?.charts?.monthlyTotals ?? []).slice(-4).map((item: any) => ({
                label: item.month,
                value: formatCurrency(item.total),
              }))}
            />
          </section>

          <section className="grid gap-3 md:grid-cols-2">
            <Card className="border-0 shadow-sm">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold">Últimos lançamentos</h2>
                </div>
                <div className="space-y-3">
                  {(data?.recentRecords ?? []).slice(0, 4).map((record: any) => (
                    <div key={record.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{record.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {record.asset?.name} • {formatDate(record.eventDate)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">{formatCurrency(Number(record.amount))}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold">Próximos pagamentos</h2>
                </div>
                <div className="space-y-3">
                  {(data?.nextPayments ?? []).slice(0, 4).map((payment: any) => (
                    <div key={payment.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{payment.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.asset?.name} • {formatDate(payment.eventDate)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">{formatCurrency(Number(payment.amount))}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}

function EmptyHome({ onCreate }: { onCreate: () => void }) {
  return (
    <Card className="overflow-hidden border-0 shadow-sm">
      <CardContent className="space-y-5 p-6 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-secondary text-5xl">⌂</div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Comece seu primeiro patrimônio</h2>
          <p className="text-sm text-muted-foreground">
            Crie apartamento, carro, casa ou qualquer outro bem. Depois acompanhe pagamentos, memórias e arquivos sem alterar o valor fixo do patrimônio.
          </p>
        </div>
        <Button className="w-full rounded-2xl" onClick={onCreate}>
          Criar primeiro patrimônio
        </Button>
      </CardContent>
    </Card>
  )
}

function SummaryCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card className={accent ? 'border-0 bg-primary text-primary-foreground shadow-sm' : 'border-0 shadow-sm'}>
      <CardContent className="space-y-2 p-4">
        <p className={`text-xs ${accent ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}

function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-base font-semibold">{title}</h2>
      {actionLabel && onAction ? (
        <button onClick={onAction} className="flex items-center gap-1 text-xs font-medium text-primary">
          {actionLabel}
          <ArrowRight className="h-3 w-3" />
        </button>
      ) : null}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary/70 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}

function MiniChartCard({
  title,
  icon: Icon,
  rows,
}: {
  title: string
  icon: React.ElementType
  rows: Array<{ label: string; value: string; color?: string }>
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">{title}</h2>
        </div>
        <div className="space-y-3">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
          ) : (
            rows.map((row) => (
              <div key={`${row.label}-${row.value}`} className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  {row.color ? <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color }} /> : null}
                  <p className="truncate text-sm">{row.label}</p>
                </div>
                <p className="text-sm font-semibold">{row.value}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
