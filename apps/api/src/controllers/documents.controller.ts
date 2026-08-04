import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../db/client'
import { getSharedAssetWhere } from '../lib/sharing'

async function assertOwnership(assetId: string) {
  const sharedWhere = await getSharedAssetWhere()
  const asset = await prisma.asset.findFirst({ where: { id: assetId, ...sharedWhere } })
  if (!asset) throw new Error('Patrimônio não encontrado')
}

export async function getDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await assertOwnership(req.params.assetId)
    const attachments = await prisma.attachment.findMany({
      where: {
        OR: [
          { assetId: req.params.assetId },
          { financialRecord: { assetId: req.params.assetId } },
          { memory: { assetId: req.params.assetId } },
        ],
        type: { in: ['PDF', 'DOCUMENT'] },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ documents: attachments })
  } catch (err) { next(err) }
}

export async function getPhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await assertOwnership(req.params.assetId)
    const attachments = await prisma.attachment.findMany({
      where: {
        OR: [
          { assetId: req.params.assetId },
          { financialRecord: { assetId: req.params.assetId } },
          { memory: { assetId: req.params.assetId } },
        ],
        type: 'IMAGE',
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ photos: attachments })
  } catch (err) { next(err) }
}
