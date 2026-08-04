import { prisma } from '../db/client'
import type { CreateMemoryInput } from '@patrimonio/shared'
import { getSharedAssetWhere } from '../lib/sharing'

async function assertAssetOwnership(assetId: string) {
  const sharedWhere = await getSharedAssetWhere()
  const asset = await prisma.asset.findFirst({ where: { id: assetId, ...sharedWhere } })
  if (!asset) throw new Error('Patrimônio não encontrado')
}

export async function listMemories(assetId: string, _userId: string) {
  await assertAssetOwnership(assetId)
  return prisma.memory.findMany({
    where: { assetId },
    include: { attachments: true },
    orderBy: { eventDate: 'desc' },
  })
}

export async function createMemory(assetId: string, _userId: string, data: CreateMemoryInput) {
  await assertAssetOwnership(assetId)
  return prisma.memory.create({
    data: { assetId, ...data, eventDate: new Date(data.eventDate) },
    include: { attachments: true },
  })
}

export async function updateMemory(id: string, assetId: string, _userId: string, data: Partial<CreateMemoryInput>) {
  await assertAssetOwnership(assetId)
  return prisma.memory.update({
    where: { id },
    data: { ...data, eventDate: data.eventDate ? new Date(data.eventDate) : undefined },
    include: { attachments: true },
  })
}

export async function deleteMemory(id: string, assetId: string, _userId: string) {
  await assertAssetOwnership(assetId)
  await prisma.memory.delete({ where: { id } })
}
