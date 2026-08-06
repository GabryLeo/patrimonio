import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'

interface UploadOptions {
  assetId?: string
  financialRecordId?: string
  memoryId?: string
}

interface UploadArgs {
  file: File
  name?: string
  options?: UploadOptions
}

export function useUpload(defaultOptions: UploadOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ file, name, options = {} }: UploadArgs) => {
      const merged = { ...defaultOptions, ...options }
      const finalName = name?.trim() || file.name

      const { data: presign } = await api.post('/upload/presign', {
        filename: finalName,
        mimeType: file.type,
        size: file.size,
      })

      await fetch(presign.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })

      const { data: confirm } = await api.post('/upload/confirm', {
        url: presign.publicUrl,
        name: finalName,
        size: file.size,
        mimeType: file.type,
        ...merged,
      })

      return confirm.attachment
    },
    onSuccess: (_, variables) => {
      const assetId = variables.options?.assetId ?? defaultOptions.assetId

      if (assetId) {
        queryClient.invalidateQueries({ queryKey: ['documents', assetId] })
        queryClient.invalidateQueries({ queryKey: ['photos', assetId] })
        queryClient.invalidateQueries({ queryKey: ['timeline', assetId] })
      }

      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'timeline'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'files'] })
    },
  })
}
