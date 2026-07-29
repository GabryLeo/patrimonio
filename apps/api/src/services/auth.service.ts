import bcrypt from 'bcryptjs'
import { prisma } from '../db/client'

export async function validateCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
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
    data: { name, email, password: hashed },
    select: { id: true, name: true, email: true, createdAt: true },
  })
}
