import { prisma } from '../db/client'
import type { CreateCategoryInput } from '@patrimonio/shared'
import { getSharedAssetWhere } from '../lib/sharing'

async function assertOwnership(assetId: string) {
  const sharedWhere = await getSharedAssetWhere()
  const asset = await prisma.asset.findFirst({ where: { id: assetId, ...sharedWhere } })
  if (!asset) throw new Error('Patrimônio não encontrado')
}

export async function listCategories(assetId: string, _userId: string) {
  await assertOwnership(assetId)
  return prisma.assetCategory.findMany({
    where: { assetId },
    orderBy: { order: 'asc' },
  })
}

export async function createCategory(assetId: string, _userId: string, data: CreateCategoryInput) {
  await assertOwnership(assetId)
  const count = await prisma.assetCategory.count({ where: { assetId } })
  return prisma.assetCategory.create({
    data: { ...data, assetId, order: data.order ?? count },
  })
}

export async function updateCategory(categoryId: string, assetId: string, _userId: string, data: Partial<CreateCategoryInput>) {
  await assertOwnership(assetId)
  return prisma.assetCategory.update({ where: { id: categoryId }, data })
}

export async function deleteCategory(categoryId: string, assetId: string, _userId: string) {
  await assertOwnership(assetId)
  await prisma.assetCategory.delete({ where: { id: categoryId } })
}
