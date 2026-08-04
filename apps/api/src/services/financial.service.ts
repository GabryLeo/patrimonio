import { prisma } from '../db/client'
import type { CreateFinancialRecordInput, UpdateFinancialRecordInput } from '@patrimonio/shared'
import { getSharedAssetWhere } from '../lib/sharing'

const INCLUDE_FULL = {
  category: true,
  attachments: { orderBy: { createdAt: 'asc' as const } },
}

async function assertAssetOwnership(assetId: string) {
  const sharedWhere = await getSharedAssetWhere()
  const asset = await prisma.asset.findFirst({ where: { id: assetId, ...sharedWhere } })
  if (!asset) throw new Error('Patrimônio não encontrado')
}

export async function listFinancial(assetId: string, _userId: string) {
  await assertAssetOwnership(assetId)
  return prisma.financialRecord.findMany({
    where: { assetId },
    include: INCLUDE_FULL,
    orderBy: { eventDate: 'desc' },
  })
}

export async function createFinancial(assetId: string, _userId: string, data: CreateFinancialRecordInput) {
  await assertAssetOwnership(assetId)
  return prisma.financialRecord.create({
    data: {
      assetId,
      categoryId: data.categoryId,
      title: data.title,
      amount: data.amount,
      eventDate: new Date(data.eventDate),
      notes: data.notes,
    },
    include: INCLUDE_FULL,
  })
}

export async function getFinancial(id: string, assetId: string, _userId: string) {
  await assertAssetOwnership(assetId)
  const record = await prisma.financialRecord.findFirst({
    where: { id, assetId },
    include: INCLUDE_FULL,
  })
  if (!record) throw new Error('Registro não encontrado')
  return record
}

export async function updateFinancial(id: string, assetId: string, userId: string, data: UpdateFinancialRecordInput) {
  await getFinancial(id, assetId, userId)
  return prisma.financialRecord.update({
    where: { id },
    data: {
      ...data,
      eventDate: data.eventDate ? new Date(data.eventDate) : undefined,
    },
    include: INCLUDE_FULL,
  })
}

export async function deleteFinancial(id: string, assetId: string, userId: string) {
  await getFinancial(id, assetId, userId)
  await prisma.financialRecord.delete({ where: { id } })
}
