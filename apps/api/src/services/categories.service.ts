import { prisma } from '../db/client'
import type { CreateCategoryInput } from '@patrimonio/shared'

async function assertOwnership(assetId: string, userId: string) {
  const asset = await prisma.asset.findFirst({ where: { id: assetId, userId } })
  if (!asset) throw new Error('Patrimônio não encontrado')
}

export async function listCategories(assetId: string, userId: string) {
  await assertOwnership(assetId, userId)
  return prisma.assetCategory.findMany({
    where: { assetId },
    orderBy: { order: 'asc' },
  })
}

export async function createCategory(assetId: string, userId: string, data: CreateCategoryInput) {
  await assertOwnership(assetId, userId)
  const count = await prisma.assetCategory.count({ where: { assetId } })
  return prisma.assetCategory.create({
    data: { ...data, assetId, order: data.order ?? count },
  })
}

export async function updateCategory(categoryId: string, assetId: string, userId: string, data: Partial<CreateCategoryInput>) {
  await assertOwnership(assetId, userId)
  return prisma.assetCategory.update({ where: { id: categoryId }, data })
}

export async function deleteCategory(categoryId: string, assetId: string, userId: string) {
  await assertOwnership(assetId, userId)
  await prisma.assetCategory.delete({ where: { id: categoryId } })
}
