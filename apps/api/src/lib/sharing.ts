import { prisma } from '../db/client'

const EMAIL_ALIASES: Record<string, string> = {
  'byelalves@yaho.com.br': 'byelalves@yahoo.com.br',
}

export const PRIMARY_SHARED_EMAIL = 'byelalves@yahoo.com.br'

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function canonicalizeEmail(email: string) {
  const normalized = normalizeEmail(email)
  return EMAIL_ALIASES[normalized] ?? normalized
}

export function getEmailCandidates(email: string) {
  const normalized = normalizeEmail(email)
  const canonical = canonicalizeEmail(email)
  return Array.from(new Set([normalized, canonical]))
}

export async function getSharedUserIds() {
  const users = await prisma.user.findMany({
    select: { id: true },
    orderBy: { createdAt: 'asc' },
  })
  return users.map((user) => user.id)
}

export async function getPrimarySharedUser() {
  return prisma.user.findFirst({
    where: {
      email: {
        in: getEmailCandidates(PRIMARY_SHARED_EMAIL),
      },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function ensureSharedAccess(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })

  if (!user) {
    throw new Error('Usuário não encontrado')
  }
}

export async function getSharedAssetWhere() {
  const userIds = await getSharedUserIds()
  return { userId: { in: userIds } }
}

export async function resolveAssetOwnerId(preferredUserId: string) {
  const primary = await getPrimarySharedUser()
  return primary?.id ?? preferredUserId
}
