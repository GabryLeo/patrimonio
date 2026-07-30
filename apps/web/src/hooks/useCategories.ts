import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'

export function useCategories(assetId: string) {
  return useQuery({
    queryKey: ['categories', assetId],
    queryFn: async () => {
      const { data } = await api.get(`/assets/${assetId}/categories`)
      return data.categories
    },
    enabled: !!assetId,
  })
}

export function useCreateCategory(assetId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; color: string; icon?: string; order?: number }) => {
      const { data } = await api.post(`/assets/${assetId}/categories`, input)
      return data.category
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories', assetId] })
      qc.invalidateQueries({ queryKey: ['assets', assetId] })
    },
  })
}

export function useDeleteCategory(assetId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (catId: string) => {
      await api.delete(`/assets/${assetId}/categories/${catId}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories', assetId] })
      qc.invalidateQueries({ queryKey: ['assets', assetId] })
    },
  })
}
