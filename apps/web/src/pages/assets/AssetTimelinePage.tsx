import { useParams } from 'react-router-dom'
import { useTimeline } from '@/hooks/useTimeline'
import { formatCurrency, formatDate, formatMonth } from '@/lib/formatters'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, Star } from 'lucide-react'

export default function AssetTimelinePage() {
  const { id } = useParams<{ id: string }>()
  const { data: events, isLoading } = useTimeline(id!)

  const grouped: Record<string, any[]> = groupByMonth(events ?? [])

  return (
    <div className="px-4 pt-6 pb-6">
      <h2 className="text-xl font-bold mb-6">Timeline</h2>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : events?.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-sm">Nenhum evento ainda</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([month, monthEvents]) => (
            <div key={month}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 capitalize">
                {month}
              </h3>
              <div className="relative pl-4">
                <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />
                <div className="space-y-3">
                  {monthEvents.map((event: any) => (
                    <div key={event.id} className="relative">
                      <div className="absolute -left-4 top-3.5 h-2 w-2 rounded-full border-2 border-background"
                        style={{ backgroundColor: event.type === 'FINANCIAL' && event.category ? event.category.color : '#8B5CF6' }}
                      />
                      <Card className="ml-2">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {event.type === 'FINANCIAL' ? (
                                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                                ) : (
                                  <Star className="h-3.5 w-3.5 text-yellow-500" />
                                )}
                                <p className="font-medium text-sm">{event.title}</p>
                              </div>
                              {event.category && (
                                <span
                                  className="inline-block text-xs px-2 py-0.5 rounded-full mb-1"
                                  style={{ backgroundColor: event.category.color + '20', color: event.category.color }}
                                >
                                  {event.category.name}
                                </span>
                              )}
                              {event.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">{formatDate(event.eventDate)}</p>
                              {event.attachments?.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">📎 {event.attachments.length} arquivo(s)</p>
                              )}
                            </div>
                            {event.amount && (
                              <p className="font-bold text-sm whitespace-nowrap">{formatCurrency(event.amount)}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function groupByMonth(events: any[]) {
  return events.reduce((acc, event) => {
    const month = formatMonth(event.eventDate)
    if (!acc[month]) acc[month] = []
    acc[month].push(event)
    return acc
  }, {} as Record<string, any[]>)
}
