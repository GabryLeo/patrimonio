import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { listUsers, createUser, deleteUser } from '../controllers/users.controller'

const router = Router()

router.use(requireAuth)
router.get('/', listUsers)
router.post('/', createUser)
router.delete('/:id', deleteUser)

export default router
