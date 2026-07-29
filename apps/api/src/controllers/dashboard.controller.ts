import type { Request, Response, NextFunction } from 'express'
import * as dashboardService from '../services/dashboard.service'
import type { AuthRequest } from '../middleware/auth.middleware'

export async function getDashboardSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const summary = await dashboardService.getDashboardSummary(userId)
    res.json(summary)
  } catch (err) { next(err) }
}
