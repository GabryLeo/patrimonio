import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import {
  listAssets, createAsset, getAsset, updateAsset, deleteAsset,
} from '../controllers/assets.controller'
import {
  listCategories, createCategory, updateCategory, deleteCategory,
} from '../controllers/categories.controller'

const router = Router()
router.use(requireAuth)

router.get('/', listAssets)
router.post('/', createAsset)
router.get('/:id', getAsset)
router.put('/:id', updateAsset)
router.delete('/:id', deleteAsset)

router.get('/:id/categories', listCategories)
router.post('/:id/categories', createCategory)
router.put('/:id/categories/:categoryId', updateCategory)
router.delete('/:id/categories/:categoryId', deleteCategory)

export default router
