import { prisma } from '../db/client'
import { startOfMonth, endOfMonth } from 'date-fns'

export async function getDashboardSummary(userId: string) {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)

  const [assets, monthlyRecords, recentRecords, recentAttachments] = await Promise.all([
    prisma.asset.findMany({
      where: { userId, status: 'ACTIVE' },
      include: {
        financials: { select: { amount: true } },
        _count: { select: { financials: true, attachments: true } },
      },
    }),
    prisma.financialRecord.findMany({
      where: {
        asset: { userId },
        eventDate: { gte: monthStart, lte: monthEnd },
      },
      include: { category: true },
    }),
    prisma.financialRecord.findMany({
      where: { asset: { userId } },
      include: { category: true, asset: { select: { name: true, type: true } } },
      orderBy: { eventDate: 'desc' },
      take: 5,
    }),
    prisma.attachment.findMany({
      where: { asset: { userId } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const totalInvested = assets.reduce((sum, asset) => {
    const assetTotal = asset.financials.reduce((s, f) => s + Number(f.amount), 0)
    return sum + assetTotal
  }, 0)

  const monthTotal = monthlyRecords.reduce((sum, r) => sum + Number(r.amount), 0)

  const nextPayments = await prisma.financialRecord.findMany({
    where: {
      asset: { userId },
      eventDate: { gte: now },
    },
    include: { category: true, asset: { select: { name: true } } },
    orderBy: { eventDate: 'asc' },
    take: 5,
  })

  return {
    totalAssets: assets.length,
    totalInvested,
    monthTotal,
    assets: assets.map((a) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      totalInvested: a.financials.reduce((s, f) => s + Number(f.amount), 0),
      recordsCount: a._count.financials,
      filesCount: a._count.attachments,
    })),
    recentRecords,
    nextPayments,
    recentAttachments,
  }
}
