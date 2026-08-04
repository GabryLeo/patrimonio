import { supabase, BUCKET } from '../lib/supabase'
import { prisma } from '../db/client'
import { getMimeType } from '@patrimonio/shared'
import { randomUUID } from 'crypto'
import { getSharedUserIds } from '../lib/sharing'

export async function getPresignedUrl(filename: string, mimeType: string) {
  const ext = filename.split('.').pop() ?? 'bin'
  const path = `${randomUUID()}.${ext}`

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path)

  if (error || !data) throw new Error('Erro ao gerar URL de upload')

  const publicUrl = supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl

  return {
    uploadUrl: data.signedUrl,
    token: data.token,
    path,
    publicUrl,
  }
}

export async function confirmUpload(data: {
  url: string
  name: string
  size: number
  mimeType: string
  assetId?: string
  financialRecordId?: string
  memoryId?: string
}) {
  return prisma.attachment.create({
    data: {
      url: data.url,
      name: data.name,
      size: data.size,
      mimeType: data.mimeType,
      type: getMimeType(data.mimeType),
      assetId: data.assetId,
      financialRecordId: data.financialRecordId,
      memoryId: data.memoryId,
    },
  })
}

export async function deleteFile(fileId: string, _userId: string) {
  const attachment = await prisma.attachment.findUnique({
    where: { id: fileId },
    include: {
      asset: true,
      financialRecord: { include: { asset: true } },
      memory: { include: { asset: true } },
    },
  })

  if (!attachment) throw new Error('Arquivo não encontrado')

  const ownerUserId =
    attachment.asset?.userId ??
    attachment.financialRecord?.asset?.userId ??
    attachment.memory?.asset?.userId

  const sharedUserIds = await getSharedUserIds()
  if (!ownerUserId || !sharedUserIds.includes(ownerUserId)) throw new Error('Sem permissão')

  const path = attachment.url.split(`${BUCKET}/`)[1]
  if (path) {
    await supabase.storage.from(BUCKET).remove([path])
  }

  await prisma.attachment.delete({ where: { id: fileId } })
}
