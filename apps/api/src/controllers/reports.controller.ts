import type { Request, Response, NextFunction } from 'express'
import * as reportsService from '../services/reports.service'
import type { AuthRequest } from '../middleware/auth.middleware'

export async function generateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const pdfBuffer = await reportsService.generateAssetReport(req.params.assetId, userId)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-patrimonio.pdf"`)
    res.send(pdfBuffer)
  } catch (err) { next(err) }
}
