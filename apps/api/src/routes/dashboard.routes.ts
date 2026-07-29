import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { getDashboardSummary } from '../controllers/dashboard.controller'
import { generateReport } from '../controllers/reports.controller'

const router = Router()
router.use(requireAuth)

router.get('/summary', getDashboardSummary)
router.get('/reports/:assetId/pdf', generateReport)

export default router
