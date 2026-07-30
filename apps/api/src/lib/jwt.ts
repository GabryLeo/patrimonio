import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import type { AuthPayload } from '@patrimonio/shared'

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any })
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, env.JWT_SECRET) as AuthPayload
}

export const COOKIE_NAME = 'patrimonio_token'

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}
