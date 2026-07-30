import type { Request, Response, NextFunction } from 'express'
import { CreateUserSchema } from '@patrimonio/shared'
import { prisma } from '../db/client'
import bcrypt from 'bcryptjs'

export async function listUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })
    res.json({ users })
  } catch (err) {
    next(err)
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = CreateUserSchema.parse(req.body)
    const existing = await prisma.user.findUnique({ where: { email: input.email } })
    if (existing) {
      res.status(409).json({ error: 'Email já cadastrado' })
      return
    }
    const hashed = await bcrypt.hash(input.password, 10)
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, password: hashed },
      select: { id: true, name: true, email: true, createdAt: true },
    })
    res.status(201).json({ user })
  } catch (err) {
    next(err)
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params
    await prisma.user.delete({ where: { id } })
    res.json({ message: 'Usuário removido' })
  } catch (err) {
    next(err)
  }
}
