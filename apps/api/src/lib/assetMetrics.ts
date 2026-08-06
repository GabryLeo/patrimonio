type MetricRecord = {
  amount: number | string
  category?: {
    id: string
    name: string
    color: string
  } | null
}

export function normalizeLabel(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

export function buildAssetMetrics(
  totalValue: number,
  records: MetricRecord[],
) {
  const totalPaid = records.reduce((sum, record) => sum + Number(record.amount), 0)
  const settledAmount = Math.min(totalPaid, totalValue)
  const overageAmount = Math.max(totalPaid - totalValue, 0)
  const remainingBalance = Math.max(totalValue - settledAmount, 0)
  const progressPercent = totalValue > 0 ? Math.min((settledAmount / totalValue) * 100, 100) : 0

  const categoryTotals = records.reduce<Record<string, { id: string; name: string; color: string; total: number }>>((acc, record) => {
    const id = record.category?.id ?? 'uncategorized'
    const name = record.category?.name ?? 'Sem categoria'
    const color = record.category?.color ?? '#94a3b8'

    if (!acc[id]) {
      acc[id] = { id, name, color, total: 0 }
    }

    acc[id].total += Number(record.amount)
    return acc
  }, {})

  return {
    totalValue,
    totalPaid,
    settledAmount,
    overageAmount,
    remainingBalance,
    progressPercent,
    categoryTotals: Object.values(categoryTotals).sort((a, b) => b.total - a.total),
  }
}
