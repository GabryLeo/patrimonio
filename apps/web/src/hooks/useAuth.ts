import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/apiClient'
import { useAuthStore } from '@/store/authStore'
import type { LoginInput } from '@patrimonio/shared'

export function useMe() {
  const setUser = useAuthStore((s) => s.setUser)
  const setAuthChecked = useAuthStore((s) => s.setAuthChecked)
  const hasHydrated = useAuthStore((s) => s.hasHydrated)

  const query = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me')
      return data.user
    },
    enabled: hasHydrated,
    retry: false,
    staleTime: 1000 * 60 * 5,
  })

  useEffect(() => {
    if (!hasHydrated || query.isPending) return

    if (query.isSuccess) {
      setUser(query.data)
      setAuthChecked(true)
      return
    }

    if (query.isError) {
      setUser(null)
      setAuthChecked(true)
    }
  }, [hasHydrated, query.isPending, query.isSuccess, query.isError, query.data, setAuthChecked, setUser])

  return query
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser)
  const setAuthChecked = useAuthStore((s) => s.setAuthChecked)

  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await api.post('/auth/login', input)
      return data
    },
    onSuccess: (data) => {
      setUser(data.user)
      setAuthChecked(true)
    },
  })
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      logout()
      queryClient.clear()
    },
  })
}
