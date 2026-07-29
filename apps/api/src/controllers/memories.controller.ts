import type { Request, Response, NextFunction } from 'express'
import * as memoriesService from '../services/memories.service'
import { CreateMemorySchema } from '@patrimonio/shared'
import type { AuthRequest } from '../middleware/auth.middleware'

export async function listMemories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const memories = await memoriesService.listMemories(req.params.assetId, userId)
    res.json({ memories })
  } catch (err) { next(err) }
}

export async function createMemory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const input = CreateMemorySchema.parse(req.body)
    const memory = await memoriesService.createMemory(req.params.assetId, userId, input)
    res.status(201).json({ memory })
  } catch (err) { next(err) }
}

export async function updateMemory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const input = CreateMemorySchema.partial().parse(req.body)
    const memory = await memoriesService.updateMemory(req.params.memoryId, req.params.assetId, userId, input)
    res.json({ memory })
  } catch (err) { next(err) }
}

export async function deleteMemory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    await memoriesService.deleteMemory(req.params.memoryId, req.params.assetId, userId)
    res.json({ message: 'Memória removida' })
  } catch (err) { next(err) }
}
