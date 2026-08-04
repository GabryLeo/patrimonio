import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { getDashboardSummary, getGlobalFiles, getGlobalTimeline } from '../controllers/dashboard.controller'
import { generateReport } from '../controllers/reports.controller'

const router = Router()
router.use(requireAuth)

router.get('/summary', getDashboardSummary)
router.get('/timeline', getGlobalTimeline)
router.get('/files', getGlobalFiles)
router.get('/reports/:assetId/pdf', generateReport)

export default router
