import { prisma } from '../db/client'
import { DEFAULT_CATEGORIES } from '@patrimonio/shared'
import type { CreateAssetInput, UpdateAssetInput, AssetType } from '@patrimonio/shared'
import { getSharedAssetWhere, resolveAssetOwnerId } from '../lib/sharing'

export async function listAssets(userId: string) {
  const where = await getSharedAssetWhere()
  return prisma.asset.findMany({
    where,
    include: { categories: { orderBy: { order: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createAsset(userId: string, data: CreateAssetInput) {
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
