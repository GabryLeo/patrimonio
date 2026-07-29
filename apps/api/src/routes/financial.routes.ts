import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import {
  listFinancial, createFinancial, getFinancial, updateFinancial, deleteFinancial,
} from '../controllers/financial.controller'
import {
  listMemories, createMemory, updateMemory, deleteMemory,
} from '../controllers/memories.controller'
import { getTimeline } from '../controllers/timeline.controller'
import { getDocuments, getPhotos } from '../controllers/documents.controller'

const router = Router({ mergeParams: true })
router.use(requireAuth)

router.get('/:assetId/financial', listFinancial)
router.post('/:assetId/financial', createFinancial)
router.get('/:assetId/financial/:recordId', getFinancial)
router.put('/:assetId/financial/:recordId', updateFinancial)
router.delete('/:assetId/financial/:recordId', deleteFinancial)

router.get('/:assetId/timeline', getTimeline)
router.get('/:assetId/documents', getDocuments)
router.get('/:assetId/photos', getPhotos)

router.get('/:assetId/memories', listMemories)
router.post('/:assetId/memories', createMemory)
router.put('/:assetId/memories/:memoryId', updateMemory)
router.delete('/:assetId/memories/:memoryId', deleteMemory)

export default router
