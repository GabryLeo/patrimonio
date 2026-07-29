import type { Request, Response, NextFunction } from 'express'
import * as authService from '../services/auth.service'
import { LoginSchema } from '@patrimonio/shared'
import { signToken, COOKIE_NAME, COOKIE_OPTIONS } from '../lib/jwt'

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = LoginSchema.parse(req.body)
    const user = await authService.validateCredentials(input.email, input.password)
    const token = signToken({ userId: user.id, email: user.email })
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS)
    res.json({ user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt } })
  } catch (err) {
    next(err)
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie(COOKIE_NAME)
  res.json({ message: 'Logout realizado' })
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req as any
    const user = await authService.getUserById(userId)
    res.json({ user })
  } catch (err) {
    next(err)
  }
}
