import { prisma } from '../db/client'
import { endOfMonth, endOfYear, format, startOfMonth, startOfYear } from 'date-fns'
import { getSharedUserIds } from '../lib/sharing'
import { buildAssetMetrics } from '../lib/assetMetrics'

export async function getDashboardSummary(_userId: string) {
  const sharedUserIds = await getSharedUserIds()
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const yearStart = startOfYear(now)
  const yearEnd = endOfYear(now)

  const [assets, monthlyRecords, yearlyRecords, recentRecords, recentMemories, recentAttachments] = await Promise.all([
    prisma.asset.findMany({
      where: { userId: { in: sharedUserIds }, status: 'ACTIVE' },
      include: {
        financials: {
          select: {
            amount: true,
            category: { select: { id: true, name: true, color: true } },
          },
        },
        _count: { select: { financials: true, attachments: true } },
      },
    }),
    prisma.financialRecord.findMany({
      where: {
        asset: { userId: { in: sharedUserIds } },
        eventDate: { gte: monthStart, lte: monthEnd },
      },
      include: { category: true },
    }),
    prisma.financialRecord.findMany({
      where: {
        asset: { userId: { in: sharedUserIds } },
        eventDate: { gte: yearStart, lte: yearEnd },
      },
      include: {
        category: true,
        asset: { select: { id: true, name: true, type: true, totalValue: true, coverImageUrl: true } },
      },
      orderBy: { eventDate: 'asc' },
    }),
    prisma.financialRecord.findMany({
      where: { asset: { userId: { in: sharedUserIds } } },
      include: { category: true, asset: { select: { name: true, type: true } } },
      orderBy: { eventDate: 'desc' },
      take: 5,
    }),
    prisma.memory.findMany({
      where: { asset: { userId: { in: sharedUserIds } } },
      include: {
        asset: { select: { id: true, name: true, type: true } },
        attachments: true,
      },
      orderBy: { eventDate: 'desc' },
      take: 5,
    }),
    prisma.attachment.findMany({
      where: { asset: { userId: { in: sharedUserIds } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const metricsByAsset = assets.map((asset) => ({
    asset,
    metrics: buildAssetMetrics(Number(asset.totalValue ?? 0), asset.financials),
  }))

  const totalInvested = metricsByAsset.reduce((sum, entry) => sum + entry.metrics.totalPaid, 0)
  const totalSettled = metricsByAsset.reduce((sum, entry) => sum + entry.metrics.settledAmount, 0)

  const monthTotal = monthlyRecords.reduce((sum, r) => sum + Number(r.amount), 0)
  const totalPatrimony = assets.reduce((sum, asset) => sum + Number(asset.totalValue ?? 0), 0)
  const totalPaid = totalInvested
  const remainingBalance = metricsByAsset.reduce((sum, entry) => sum + entry.metrics.remainingBalance, 0)
  const totalOverage = metricsByAsset.reduce((sum, entry) => sum + entry.metrics.overageAmount, 0)

  const categoryTotals = yearlyRecords.reduce<Record<string, { name: string; color: string; total: number }>>((acc, record) => {
    const key = record.category?.id ?? 'uncategorized'
    const color = record.category?.color ?? '#94a3b8'
    const name = record.category?.name ?? 'Sem categoria'

    if (!acc[key]) {
      acc[key] = { name, color, total: 0 }
    }

    acc[key].total += Number(record.amount)
    return acc
  }, {})

  const monthlyTotals = yearlyRecords.reduce<Record<string, number>>((acc, record) => {
    const key = format(record.eventDate, 'yyyy-MM')
    acc[key] = (acc[key] ?? 0) + Number(record.amount)
    return acc
  }, {})

  const growthByMonth = Object.entries(monthlyTotals).map(([month, total]) => ({
    month,
    total,
  }))

  let runningGrowth = 0
  const patrimonyGrowth = growthByMonth.map((entry) => {
    runningGrowth += entry.total
    return {
      month: entry.month,
      total: runningGrowth,
    }
  })

  const nextPayments = await prisma.financialRecord.findMany({
    where: {
      asset: { userId: { in: sharedUserIds } },
      eventDate: { gte: now },
    },
    include: { category: true, asset: { select: { name: true } } },
    orderBy: { eventDate: 'asc' },
    take: 5,
  })

  return {
    totalAssets: assets.length,
    totalPatrimony,
    totalInvested,
    totalPaid,
    totalSettled,
    remainingBalance,
    monthTotal,
    totalOverage,
    assets: metricsByAsset.map(({ asset, metrics }) => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      photoUrl: asset.coverImageUrl,
      purchaseValue: Number(asset.totalValue ?? 0),
      totalPaid: metrics.totalPaid,
      settledAmount: metrics.settledAmount,
      overageAmount: metrics.overageAmount,
      remainingBalance: metrics.remainingBalance,
      progressPercent: metrics.progressPercent,
      categoryTotals: metrics.categoryTotals,
      recordsCount: asset._count.financials,
      filesCount: asset._count.attachments,
    })),
    recentRecords,
    recentMemories,
    nextPayments,
    recentAttachments,
    charts: {
      categoryTotals: Object.values(categoryTotals).sort((a, b) => b.total - a.total),
      monthlyTotals: growthByMonth,
      patrimonyGrowth,
    },
  }
}

export async function getGlobalTimeline(_userId: string) {
  const sharedUserIds = await getSharedUserIds()
  const [financials, memories, assets] = await Promise.all([
    prisma.financialRecord.findMany({
      where: { asset: { userId: { in: sharedUserIds } } },
      include: {
        category: true,
        asset: { select: { id: true, name: true, type: true } },
        attachments: true,
      },
      orderBy: { eventDate: 'desc' },
    }),
    prisma.memory.findMany({
      where: { asset: { userId: { in: sharedUserIds } } },
      include: {
        asset: { select: { id: true, name: true, type: true } },
        attachments: true,
      },
      orderBy: { eventDate: 'desc' },
    }),
    prisma.asset.findMany({
      where: { userId: { in: sharedUserIds } },
      include: {
        categories: {
          select: { id: true, name: true, color: true },
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    }),
  ])

  const events = [
    ...financials.map((record) => ({
      id: record.id,
      type: 'FINANCIAL' as const,
      title: record.title,
      amount: Number(record.amount),
      notes: record.notes,
      eventDate: record.eventDate,
      asset: record.asset,
      category: record.category
        ? {
            id: record.category.id,
            name: record.category.name,
            color: record.category.color,
          }
        : null,
      attachments: record.attachments,
      proof: record.attachments[0] ?? null,
      memory: null,
    })),
    ...memories.map((memory) => ({
      id: memory.id,
      type: 'MEMORY' as const,
      title: memory.title,
      amount: null,
      notes: memory.description,
      eventDate: memory.eventDate,
      asset: memory.asset,
      category: null,
      attachments: memory.attachments,
      proof: memory.attachments[0] ?? null,
      memory: {
        id: memory.id,
        title: memory.title,
        description: memory.description,
      },
    })),
  ].sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime())

  return {
    filters: {
      assets: assets.map((asset) => ({ id: asset.id, name: asset.name })),
      categories: assets.flatMap((asset) => asset.categories),
    },
    events,
  }
}

export async function getGlobalFiles(_userId: string) {
  const sharedUserIds = await getSharedUserIds()
  const attachments = await prisma.attachment.findMany({
    where: {
      OR: [
        { asset: { userId: { in: sharedUserIds } } },
        { financialRecord: { asset: { userId: { in: sharedUserIds } } } },
        { memory: { asset: { userId: { in: sharedUserIds } } } },
      ],
    },
    include: {
      asset: { select: { id: true, name: true } },
      financialRecord: {
        select: {
          id: true,
          title: true,
          category: { select: { id: true, name: true, color: true } },
          asset: { select: { id: true, name: true } },
        },
      },
      memory: {
        select: {
          id: true,
          title: true,
          asset: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const files = attachments.map((attachment) => {
    const sourceAsset =
      attachment.asset ??
      attachment.financialRecord?.asset ??
      attachment.memory?.asset ??
      null

    const labelByType: Record<string, string> = {
      PDF: 'boleto',
      IMAGE: 'imagem',
      DOCUMENT: 'contrato',
      VIDEO: 'arquivo',
      AUDIO: 'arquivo',
    }

    return {
      ...attachment,
      asset: sourceAsset,
      category: attachment.financialRecord?.category ?? null,
      kind: labelByType[attachment.type] ?? 'recibo',
      sourceTitle: attachment.financialRecord?.title ?? attachment.memory?.title ?? attachment.name,
    }
  })

  return { files }
}
