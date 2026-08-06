import { useMemo, useState } from 'react'
import { CalendarRange, FileText, Filter, Landmark, MessageSquare } from 'lucide-react'
import { useGlobalTimeline } from '@/hooks/useDashboard'
import { formatCurrency, formatDate, formatMonth } from '@/lib/formatters'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'

type FilterOption = { value: string; label: string }

type TimelineEvent = {
  id: string
  type: 'FINANCIAL' | 'MEMORY'
  title: string
  amount?: number | null
  notes?: string | null
  eventDate: string
  asset?: { id: string; name: string } | null
  category?: { id: string; name: string; color: string } | null
  proof?: { name: string } | null
  memory?: { title: string } | null
}

export default function TimelinePage() {
  const { data, isLoading, isError } = useGlobalTimeline()
  const [year, setYear] = useState('all')
  const [month, setMonth] = useState('all')
  const [assetId, setAssetId] = useState('all')
  const [categoryId, setCategoryId] = useState('all')

  const events = (data?.events ?? []) as TimelineEvent[]
  const assets = (data?.filters?.assets ?? []) as Array<{ id: string; name: string }>
  const categories = (data?.filters?.categories ?? []) as Array<{ id: string; name: string }>

  const years = useMemo(
    () => Array.from(new Set(events.map((event) => String(new Date(event.eventDate).getFullYear())))).sort((a, b) => Number(b) - Number(a)),
    [events],
  )

  const months = useMemo(
    () => Array.from(new Set(events.map((event) => String(new Date(event.eventDate).getMonth() + 1).padStart(2, '0')))).sort(),
    [events],
  )

  const filtered = events.filter((event) => {
    const eventDate = new Date(event.eventDate)
    const matchesYear = year === 'all' || String(eventDate.getFullYear()) === year
    const matchesMonth = month === 'all' || String(eventDate.getMonth() + 1).padStart(2, '0') === month
    const matchesAsset = assetId === 'all' || event.asset?.id === assetId
    const matchesCategory = categoryId === 'all' || event.category?.id === categoryId
    return matchesYear && matchesMonth && matchesAsset && matchesCategory
  })

  const grouped = filtered.reduce<Record<string, TimelineEvent[]>>((acc, event) => {
    const key = formatMonth(event.eventDate)
    if (!acc[key]) acc[key] = []
    acc[key].push(event)
    return acc
  }, {})

  return (
    <div className="space-y-6 px-4 pb-6 pt-8">
      <div>
        <p className="text-sm text-muted-foreground">Evolução completa</p>
        <h1 className="text-2xl font-bold">Linha do tempo</h1>
      </div>

      <Card className="border-0 bg-card/80 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4" />
              Filtros
            </div>
            <span className="text-xs text-muted-foreground">
              {filtered.length} evento(s) visível(is)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <FilterSelect
              value={year}
              onValueChange={setYear}
              placeholder="Ano"
              options={[{ value: 'all', label: 'Todos anos' }, ...years.map((value) => ({ value, label: value }))]}
            />
            <FilterSelect
              value={month}
              onValueChange={setMonth}
              placeholder="Mês"
              options={[{ value: 'all', label: 'Todos meses' }, ...months.map((value) => ({ value, label: value }))]}
            />
            <FilterSelect
              value={assetId}
              onValueChange={setAssetId}
              placeholder="Patrimônio"
              options={[{ value: 'all', label: 'Todos patrimônios' }, ...assets.map((asset) => ({ value: asset.id, label: asset.name }))]}
            />
            <FilterSelect
              value={categoryId}
              onValueChange={setCategoryId}
              placeholder="Categoria"
              options={[{ value: 'all', label: 'Todas categorias' }, ...categories.map((category) => ({ value: category.id, label: category.name }))]}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => <Skeleton key={item} className="h-24" />)}
        </div>
      ) : isError ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Não foi possível carregar a linha do tempo agora.
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {events.length === 0
              ? 'Nenhum evento registrado ainda.'
              : 'Nenhum evento encontrado com os filtros atuais.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {(Object.entries(grouped) as Array<[string, TimelineEvent[]]>).map(([group, groupEvents]) => (
            <section key={group} className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{group}</h2>
              <div className="relative space-y-3 pl-4">
                <div className="absolute bottom-2 left-0 top-2 w-px bg-border" />
                {groupEvents.map((event) => (
                  <Card key={`${event.type}-${event.id}`} className="relative ml-2 overflow-hidden border-0 shadow-sm">
                    <span className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: event.category?.color ?? '#0f172a' }} />
                    <CardContent className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {event.asset?.name} • {formatDate(event.eventDate)}
                          </p>
                        </div>
                        {event.amount != null ? <p className="text-sm font-bold">{formatCurrency(event.amount)}</p> : null}
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        {event.category ? (
                          <span className="rounded-full px-2 py-1" style={{ backgroundColor: `${event.category.color}20`, color: event.category.color }}>
                            {event.category.name}
                          </span>
                        ) : null}
                        <span className="rounded-full bg-secondary px-2 py-1">
                          {event.type === 'FINANCIAL' ? 'Lançamento' : 'Memória'}
                        </span>
                      </div>

                      <div className="grid gap-2 text-xs text-muted-foreground">
                        <MetaRow icon={CalendarRange} text={formatDate(event.eventDate, 'dd/MM/yyyy')} />
                        <MetaRow icon={Landmark} text={event.proof ? `Comprovante: ${event.proof.name}` : 'Sem comprovante'} />
                        <MetaRow icon={MessageSquare} text={event.notes || 'Sem observações'} />
                        <MetaRow icon={FileText} text={event.memory?.title ? `Memória: ${event.memory.title}` : 'Sem memória relacionada'} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterSelect({
  value,
  onValueChange,
  placeholder,
  options,
}: {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  options: FilterOption[]
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function MetaRow({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5" />
      <span>{text}</span>
    </div>
  )
}
