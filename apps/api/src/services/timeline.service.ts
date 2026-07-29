import { prisma } from '../db/client'

export async function getTimeline(assetId: string, userId: string) {
  const asset = await prisma.asset.findFirst({ where: { id: assetId, userId } })
  if (!asset) throw new Error('Patrimônio não encontrado')

  const [financials, memories] = await Promise.all([
    prisma.financialRecord.findMany({
      where: { assetId },
      include: { category: true, attachments: true },
      orderBy: { eventDate: 'desc' },
    }),
    prisma.memory.findMany({
      where: { assetId },
      include: { attachments: true },
      orderBy: { eventDate: 'desc' },
    }),
  ])

  type TimelineEvent = {
    id: string
    type: 'FINANCIAL' | 'MEMORY'
    title: string
    description?: string | null
    amount?: number
    eventDate: Date
    category?: { name: string; color: string } | null
    attachments: Array<{ id: string; url: string; name: string; type: string; mimeType: string }>
  }

  const events: TimelineEvent[] = [
    ...financials.map((f) => ({
      id: f.id,
      type: 'FINANCIAL' as const,
      title: f.title,
      amount: Number(f.amount),
      eventDate: f.eventDate,
      category: f.category ? { name: f.category.name, color: f.category.color } : null,
      attachments: f.attachments,
    })),
    ...memories.map((m) => ({
      id: m.id,
      type: 'MEMORY' as const,
      title: m.title,
      description: m.description,
      eventDate: m.eventDate,
      attachments: m.attachments,
    })),
  ]

  return events.sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime())
}
