import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as uploadService from '../services/upload.service'
import type { AuthRequest } from '../middleware/auth.middleware'

const PresignSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().positive().max(100 * 1024 * 1024), // 100MB max
})

const ConfirmSchema = z.object({
  url: z.string().url(),
  name: z.string(),
  size: z.number(),
  mimeType: z.string(),
  assetId: z.string().optional(),
  financialRecordId: z.string().optional(),
  memoryId: z.string().optional(),
})

export async function getPresignedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = PresignSchema.parse(req.body)
    const result = await uploadService.getPresignedUrl(input.filename, input.mimeType)
    res.json(result)
  } catch (err) { next(err) }
}

export async function confirmUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = ConfirmSchema.parse(req.body)
    const attachment = await uploadService.confirmUpload(input)
    res.status(201).json({ attachment })
  } catch (err) { next(err) }
}

export async function deleteFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    await uploadService.deleteFile(req.params.fileId, userId)
    res.json({ message: 'Arquivo removido' })
  } catch (err) { next(err) }
}
