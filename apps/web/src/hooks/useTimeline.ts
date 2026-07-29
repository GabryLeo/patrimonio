import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'

export function useTimeline(assetId: string) {
  return useQuery({
    queryKey: ['timeline', assetId],
    queryFn: async () => {
      const { data } = await api.get(`/assets/${assetId}/timeline`)
      return data.events
    },
    enabled: !!assetId,
  })
}
