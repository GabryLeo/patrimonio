import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import type { CreateFinancialRecordInput, UpdateFinancialRecordInput } from '@patrimonio/shared'

export function useFinancial(assetId: string) {
  return useQuery({
    queryKey: ['financial', assetId],
    queryFn: async () => {
      const { data } = await api.get(`/assets/${assetId}/financial`)
      return data.records
    },
    enabled: !!assetId,
  })
}

export function useCreateFinancial(assetId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateFinancialRecordInput) => {
      const { data } = await api.post(`/assets/${assetId}/financial`, input)
      return data.record
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financial', assetId] })
      qc.invalidateQueries({ queryKey: ['timeline', assetId] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'timeline'] })
    },
  })
}

export function useUpdateFinancial(assetId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFinancialRecordInput }) => {
      const { data: res } = await api.put(`/assets/${assetId}/financial/${id}`, data)
      return res.record
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financial', assetId] })
      qc.invalidateQueries({ queryKey: ['timeline', assetId] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'timeline'] })
    },
  })
}

export function useDeleteFinancial(assetId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/assets/${assetId}/financial/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['financial', assetId] })
      qc.invalidateQueries({ queryKey: ['timeline', assetId] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['dashboard', 'timeline'] })
    },
  })
}
