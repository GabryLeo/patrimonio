import bcrypt from 'bcryptjs'
import { env } from '../config/env'
import { prisma } from '../db/client'
import { canonicalizeEmail, getEmailCandidates } from '../lib/sharing'

async function upsertBootstrapUser(email: string, password: string) {
  const canonicalEmail = canonicalizeEmail(email)
  const hashed = await bcrypt.hash(password, 12)
  const existing = await prisma.user.findFirst({
    where: { email: { in: getEmailCandidates(canonicalEmail) } },
    orderBy: { createdAt: 'asc' },
  })

  if (existing) {
    return prisma.user.update({
      where: { id: existing.id },
      data: {
        name: env.BOOTSTRAP_LOGIN_NAME,
        email: canonicalEmail,
        password: hashed,
      },
    })
  }

  return prisma.user.create({
    data: {
      name: env.BOOTSTRAP_LOGIN_NAME,
      email: canonicalEmail,
      password: hashed,
    },
  })
}

export async function validateCredentials(email: string, password: string) {
  const canonicalEmail = canonicalizeEmail(email)

  if (
    env.BOOTSTRAP_LOGIN_EMAIL &&
    env.BOOTSTRAP_LOGIN_PASSWORD &&
    canonicalEmail === canonicalizeEmail(env.BOOTSTRAP_LOGIN_EMAIL) &&
    password === env.BOOTSTRAP_LOGIN_PASSWORD
  ) {
    return upsertBootstrapUser(canonicalEmail, env.BOOTSTRAP_LOGIN_PASSWORD)
  }

  const user = await prisma.user.findFirst({
    where: { email: { in: getEmailCandidates(canonicalEmail) } },
    orderBy: { createdAt: 'asc' },
  })
  if (!user) throw new Error('Credenciais inválidas')
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error('Credenciais inválidas')
  return user
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true },
  })
  if (!user) throw new Error('Usuário não encontrado')
  return user
}

export async function createUser(name: string, email: string, password: string) {
  const hashed = await bcrypt.hash(password, 12)
  return prisma.user.create({
    data: { name, email: canonicalizeEmail(email), password: hashed },
    select: { id: true, name: true, email: true, createdAt: true },
  })
}
