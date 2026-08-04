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

export async function getGlobalTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const timeline = await dashboardService.getGlobalTimeline(userId)
    res.json(timeline)
  } catch (err) { next(err) }
}

export async function getGlobalFiles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const files = await dashboardService.getGlobalFiles(userId)
    res.json(files)
  } catch (err) { next(err) }
}
