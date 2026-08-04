import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/summary')
      return data
    },
  })
}

export function useGlobalTimeline() {
  return useQuery({
    queryKey: ['dashboard', 'timeline'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/timeline')
      return data
    },
  })
}

export function useGlobalFiles() {
  return useQuery({
    queryKey: ['dashboard', 'files'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/files')
      return data
    },
  })
}
