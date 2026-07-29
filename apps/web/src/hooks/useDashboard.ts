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
