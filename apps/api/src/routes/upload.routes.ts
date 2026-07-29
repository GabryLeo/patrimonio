import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { uploadRateLimit } from '../middleware/rateLimit.middleware'
import { getPresignedUrl, confirmUpload, deleteFile } from '../controllers/upload.controller'

const router = Router()
router.use(requireAuth)

router.post('/presign', uploadRateLimit, getPresignedUrl)
router.post('/confirm', confirmUpload)
router.delete('/:fileId', deleteFile)

export default router
