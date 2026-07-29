import type { Request, Response, NextFunction } from 'express'
import * as timelineService from '../services/timeline.service'
import type { AuthRequest } from '../middleware/auth.middleware'

export async function getTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const events = await timelineService.getTimeline(req.params.assetId, userId)
    res.json({ events })
  } catch (err) { next(err) }
}
