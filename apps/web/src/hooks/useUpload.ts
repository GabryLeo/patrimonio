import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'

interface UploadOptions {
  assetId?: string
  financialRecordId?: string
  memoryId?: string
}

export function useUpload(options: UploadOptions = {}) {
  return useMutation({
    mutationFn: async (file: File) => {
      // 1. Get presigned URL
      const { data: presign } = await api.post('/upload/presign', {
        filename: file.name,
        mimeType: file.type,
        size: file.size,
      })

      // 2. Upload directly to Supabase
      await fetch(presign.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      // 3. Confirm upload
      const { data: confirm } = await api.post('/upload/confirm', {
        url: presign.publicUrl,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        ...options,
      })

      return confirm.attachment
    },
  })
}
