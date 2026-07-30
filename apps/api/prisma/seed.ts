import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hash = (pwd: string) => bcrypt.hash(pwd, 10)

  const gabry = await prisma.user.upsert({
    where: { email: 'gabry@patrimonio.app' },
    update: {},
    create: {
      name: 'Gabryel',
      email: 'gabry@patrimonio.app',
      password: await hash('patrimonio2026'),
    },
  })

  const lu = await prisma.user.upsert({
    where: { email: 'lu@patrimonio.app' },
    update: {},
    create: {
      name: 'Lu',
      email: 'lu@patrimonio.app',
      password: await hash('patrimonio2026'),
    },
  })

  console.log('✅ Usuários criados:')
  console.log(`  ${gabry.email}`)
  console.log(`  ${lu.email}`)
  console.log('🔑 Senha: patrimonio2026')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
