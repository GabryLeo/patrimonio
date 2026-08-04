import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL ?? ''}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const pathname = window.location.pathname
    const requestUrl = String(error.config?.url ?? '')

    if (error.response?.status === 401) {
      useAuthStore.getState().logout()

      const isAuthBootstrap = requestUrl.includes('/auth/me')
      const isAuthScreen = pathname.includes('/login')

      if (!isAuthBootstrap && !isAuthScreen) {
        window.location.replace('/login')
      }
    }

    return Promise.reject(error)
  }
)
