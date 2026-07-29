import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('senha123', 12)

  const user = await prisma.user.upsert({
    where: { email: 'admin@patrimonio.app' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@patrimonio.app',
      password,
    },
  })

  console.log('Seed completo:', user.email)
}

main().catch(console.error).finally(() => prisma.$disconnect())
