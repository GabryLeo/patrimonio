import type { Request, Response, NextFunction } from 'express'
import { verifyToken, COOKIE_NAME } from '../lib/jwt'

export interface AuthRequest extends Request {
  userId: string
  userEmail: string
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies[COOKIE_NAME]

  if (!token) {
    res.status(401).json({ error: 'Não autenticado' })
    return
  }

  try {
    const payload = verifyToken(token)
    ;(req as AuthRequest).userId = payload.userId
    ;(req as AuthRequest).userEmail = payload.email
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}
