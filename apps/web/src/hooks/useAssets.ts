import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type { CreateAssetInput, UpdateAssetInput } from '@patrimonio/shared'

export function useAssets() {
  return useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const { data } = await api.get('/assets')
      return data.assets
    },
  })
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: ['assets', id],
    queryFn: async () => {
      const { data } = await api.get(`/assets/${id}`)
      return data.asset
    },
    enabled: !!id,
  })
}

export function useCreateAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateAssetInput) => {
      const { data } = await api.post('/assets', input)
      return data.asset
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'timeline'] })
    },
  })
}

export function useUpdateAsset(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateAssetInput) => {
      const { data } = await api.put(`/assets/${id}`, input)
      return data.asset
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] })
      qc.invalidateQueries({ queryKey: ['assets', id] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'timeline'] })
    },
  })
}

export function useDeleteAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/assets/${id}`)
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'timeline'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'files'] })
    },
  })
}
