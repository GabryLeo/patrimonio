import bcrypt from 'bcryptjs'
import { env } from '../config/env'
import { prisma } from '../db/client'

async function upsertBootstrapUser(email: string, password: string) {
  const hashed = await bcrypt.hash(password, 12)
  return prisma.user.upsert({
    where: { email },
    update: {
      name: env.BOOTSTRAP_LOGIN_NAME,
      password: hashed,
    },
    create: {
      name: env.BOOTSTRAP_LOGIN_NAME,
      email,
      password: hashed,
    },
  })
}

export async function validateCredentials(email: string, password: string) {
  if (
    env.BOOTSTRAP_LOGIN_EMAIL &&
    env.BOOTSTRAP_LOGIN_PASSWORD &&
    email.toLowerCase() === env.BOOTSTRAP_LOGIN_EMAIL.toLowerCase() &&
    password === env.BOOTSTRAP_LOGIN_PASSWORD
  ) {
    return upsertBootstrapUser(env.BOOTSTRAP_LOGIN_EMAIL, env.BOOTSTRAP_LOGIN_PASSWORD)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('Credenciais invÃ¡lidas')
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) throw new Error('Credenciais invÃ¡lidas')
  return user
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true },
  })
  if (!user) throw new Error('UsuÃ¡rio nÃ£o encontrado')
  return user
}

export async function createUser(name: string, email: string, password: string) {
  const hashed = await bcrypt.hash(password, 12)
  return prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, name: true, email: true, createdAt: true },
  })
}
