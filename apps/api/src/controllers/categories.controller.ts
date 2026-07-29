import type { Request, Response, NextFunction } from 'express'
import * as categoriesService from '../services/categories.service'
import { CreateCategorySchema } from '@patrimonio/shared'
import type { AuthRequest } from '../middleware/auth.middleware'

export async function listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const categories = await categoriesService.listCategories(req.params.id, userId)
    res.json({ categories })
  } catch (err) { next(err) }
}

export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const input = CreateCategorySchema.parse(req.body)
    const category = await categoriesService.createCategory(req.params.id, userId, input)
    res.status(201).json({ category })
  } catch (err) { next(err) }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    const input = CreateCategorySchema.partial().parse(req.body)
    const category = await categoriesService.updateCategory(req.params.categoryId, req.params.id, userId, input)
    res.json({ category })
  } catch (err) { next(err) }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as AuthRequest
    await categoriesService.deleteCategory(req.params.categoryId, req.params.id, userId)
    res.json({ message: 'Categoria removida' })
  } catch (err) { next(err) }
}
