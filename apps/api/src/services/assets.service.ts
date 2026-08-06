import { prisma } from '../db/client'
import { DEFAULT_CATEGORIES } from '@patrimonio/shared'
import type { CreateAssetInput, UpdateAssetInput, AssetType } from '@patrimonio/shared'
import { getSharedAssetWhere, resolveAssetOwnerId } from '../lib/sharing'
import { normalizeLabel } from '../lib/assetMetrics'

async function assertUniqueAssetName(name: string, excludeId?: string) {
  const where = await getSharedAssetWhere()
  const assets = await prisma.asset.findMany({
    where,
    select: { id: true, name: true },
  })

  const normalizedName = normalizeLabel(name)
  const conflict = assets.find((asset) => asset.id !== excludeId && normalizeLabel(asset.name) === normalizedName)

  if (conflict) {
    throw new Error('Já existe um patrimônio com esse nome')
  }
}

async function assertAssetValueNotLowerThanPaid(assetId: string, totalValue?: number | null) {
  if (totalValue == null) return

  const financials = await prisma.financialRecord.findMany({
    where: { assetId },
    select: { amount: true },
  })

  const totalPaid = financials.reduce((sum, item) => sum + Number(item.amount), 0)
  if (totalPaid > 0 && totalValue < totalPaid) {
    throw new Error(`O valor do patrimônio não pode ficar abaixo do total já pago (${totalPaid.toFixed(2)})`)
  }
}

export async function listAssets(userId: string) {
  const where = await getSharedAssetWhere()
  return prisma.asset.findMany({
    where,
    include: { categories: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createAsset(userId: string, data: CreateAssetInput) {
  await assertUniqueAssetName(data.name)
  const defaults = DEFAULT_CATEGORIES[data.type as AssetType] ?? []
  const ownerUserId = await resolveAssetOwnerId(userId)
  return prisma.asset.create({
    data: {
      ...data,
      userId: ownerUserId,
      totalValue: data.totalValue ?? undefined,
      acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : undefined,
      categories: {
        create: defaults.map((cat, i) => ({ ...cat, order: i })),
      },
    },
    include: { categories: { orderBy: { order: 'asc' } } },
  })
}

export async function getAsset(id: string, userId: string) {
  const where = await getSharedAssetWhere()
  const asset = await prisma.asset.findFirst({
    where: { id, ...where },
    include: {
      categories: { orderBy: { order: 'asc' } },
      _count: { select: { financials: true, memories: true, attachments: true } },
    },
  })
  if (!asset) throw new Error('Patrimônio não encontrado')
  return asset
}

export async function updateAsset(id: string, userId: string, data: UpdateAssetInput) {
  await getAsset(id, userId)
  if (data.name) {
    await assertUniqueAssetName(data.name, id)
  }
  if (data.totalValue != null) {
    await assertAssetValueNotLowerThanPaid(id, data.totalValue)
  }
  return prisma.asset.update({
    where: { id },
    data: {
      ...data,
      totalValue: data.totalValue ?? undefined,
      acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : undefined,
    },
    include: { categories: { orderBy: { order: 'asc' } } },
  })
}

export async function deleteAsset(id: string, userId: string) {
  await getAsset(id, userId)
  await prisma.asset.delete({ where: { id } })
}
