import { Router } from 'express'
import authRoutes from './auth.routes'
import assetsRoutes from './assets.routes'
import financialRoutes from './financial.routes'
import uploadRoutes from './upload.routes'
import dashboardRoutes from './dashboard.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/assets', assetsRoutes)
router.use('/assets', financialRoutes)
router.use('/upload', uploadRoutes)
router.use('/dashboard', dashboardRoutes)

export default router
