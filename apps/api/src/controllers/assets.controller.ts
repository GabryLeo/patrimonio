import type { Request, Response, NextFunction } from 'express'
import * as assetsService from '../services/assets.service'
import { CreateAssetSchema, UpdateAssetSchema } from '@patrimonio/shared'
import type { AuthRequest } from '../middleware/auth.middleware'

export async function listAssets(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const assets = await assetsService.listAssets(userId)
    res.json({ assets })
  } catch (err) { next(err) }
}

export async function createAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const input = CreateAssetSchema.parse(req.body)
    const asset = await assetsService.createAsset(userId, input)
    res.status(201).json({ asset })
  } catch (err) { next(err) }
}

export async function getAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const asset = await assetsService.getAsset(req.params.id, userId)
    res.json({ asset })
  } catch (err) { next(err) }
}

export async function updateAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const input = UpdateAssetSchema.parse(req.body)
    const asset = await assetsService.updateAsset(req.params.id, userId, input)
    res.json({ asset })
  } catch (err) { next(err) }
}

export async function deleteAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    await assetsService.deleteAsset(req.params.id, userId)
    res.json({ message: 'Patrimônio removido' })
  } catch (err) { next(err) }
}
