import type { Request, Response, NextFunction } from 'express'
import { CreateUserSchema } from '@patrimonio/shared'
import { prisma } from '../db/client'
import bcrypt from 'bcryptjs'
import { canonicalizeEmail, getEmailCandidates, PRIMARY_SHARED_EMAIL } from '../lib/sharing'

export async function listUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })

    const deduped = new Map<string, (typeof users)[number]>()
    for (const user of users) {
      const canonicalEmail = canonicalizeEmail(user.email)
      const current = deduped.get(canonicalEmail)
      if (!current || new Date(user.createdAt).getTime() < new Date(current.createdAt).getTime()) {
        deduped.set(canonicalEmail, { ...user, email: canonicalEmail })
      }
    }

    res.json({
      users: Array.from(deduped.values()).filter((user) => canonicalizeEmail(user.email) !== canonicalizeEmail('byelalves@yaho.com.br')),
    })
  } catch (err) {
    next(err)
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = CreateUserSchema.parse(req.body)
    const email = canonicalizeEmail(input.email)
    const existing = await prisma.user.findFirst({ where: { email: { in: getEmailCandidates(email) } } })
    if (existing) {
      res.status(409).json({ error: 'Email já cadastrado' })
      return
    }
    const hashed = await bcrypt.hash(input.password, 10)
    const user = await prisma.user.create({
      data: { name: input.name, email, password: hashed },
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
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' })
      return
    }
    if (canonicalizeEmail(user.email) === PRIMARY_SHARED_EMAIL) {
      res.status(400).json({ error: 'Usuário principal não pode ser removido' })
      return
    }

    const duplicates = await prisma.user.findMany({
      where: { email: { in: getEmailCandidates(user.email) } },
      select: { id: true },
    })
    await prisma.user.deleteMany({
      where: { id: { in: duplicates.map((item) => item.id) } },
    })
    res.json({ message: 'Usuário removido' })
  } catch (err) {
    next(err)
  }
}
