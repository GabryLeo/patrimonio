import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../db/client'
import type { AuthRequest } from '../middleware/auth.middleware'

async function assertOwnership(assetId: string, userId: string) {
  const asset = await prisma.asset.findFirst({ where: { id: assetId, userId } })
  if (!asset) throw new Error('Patrimônio não encontrado')
}

export async function getDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    await assertOwnership(req.params.assetId, userId)
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
    const { userId } = req as AuthRequest
    await assertOwnership(req.params.assetId, userId)
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
