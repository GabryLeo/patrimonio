import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.SEED_EMAIL ?? 'Byelalves@yahoo.com.br'
  const password = process.env.SEED_PASSWORD
  if (!password) throw new Error('SEED_PASSWORD env var required')

  await prisma.user.deleteMany()

  const user = await prisma.user.create({
    data: {
      name: 'Gabryel & Lu',
      email,
      password: await bcrypt.hash(password, 10),
    },
  })

  console.log('✅ Usuário criado:', user.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
