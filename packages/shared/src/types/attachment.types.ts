export type AttachmentType = 'PDF' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT'

export const ACCEPTED_MIME_TYPES: Record<AttachmentType, string[]> = {
  PDF: ['application/pdf'],
  IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  VIDEO: ['video/mp4', 'video/quicktime'],
  AUDIO: ['audio/mpeg', 'audio/wav'],
  DOCUMENT: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
}

export function getMimeType(mimeType: string): AttachmentType {
  for (const [type, mimes] of Object.entries(ACCEPTED_MIME_TYPES)) {
    if (mimes.includes(mimeType)) return type as AttachmentType
  }
  return 'DOCUMENT'
}
