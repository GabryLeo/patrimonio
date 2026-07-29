import type { Request, Response, NextFunction } from 'express'
import * as financialService from '../services/financial.service'
import { CreateFinancialRecordSchema, UpdateFinancialRecordSchema } from '@patrimonio/shared'
import type { AuthRequest } from '../middleware/auth.middleware'

export async function listFinancial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const records = await financialService.listFinancial(req.params.assetId, userId)
    res.json({ records })
  } catch (err) { next(err) }
}

export async function createFinancial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const input = CreateFinancialRecordSchema.parse(req.body)
    const record = await financialService.createFinancial(req.params.assetId, userId, input)
    res.status(201).json({ record })
  } catch (err) { next(err) }
}

export async function getFinancial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const record = await financialService.getFinancial(req.params.recordId, req.params.assetId, userId)
    res.json({ record })
  } catch (err) { next(err) }
}

export async function updateFinancial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const input = UpdateFinancialRecordSchema.parse(req.body)
    const record = await financialService.updateFinancial(req.params.recordId, req.params.assetId, userId, input)
    res.json({ record })
  } catch (err) { next(err) }
}

export async function deleteFinancial(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    await financialService.deleteFinancial(req.params.recordId, req.params.assetId, userId)
    res.json({ message: 'Registro removido' })
  } catch (err) { next(err) }
}
