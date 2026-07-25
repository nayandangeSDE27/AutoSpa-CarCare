import axios from 'axios'

import { useAuthStore } from '../stores/auth.store.js'
import { createResponseErrorHandler } from './refreshInterceptor.js'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({ baseURL })

// --- Request: attach the access token from the auth store ---
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// --- Refresh: a single in-flight refresh shared by concurrent 401s ---
let refreshPromise = null

function refreshAccessToken() {
  if (!refreshPromise) {
    const { refreshToken } = useAuthStore.getState()
    if (!refreshToken) {
      return Promise.reject(new Error('No refresh token'))
    }
    // Use a bare axios call (not `api`) so this request skips the interceptors
    // and can never itself trigger another refresh.
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh-token`, { refreshToken })
      .then((res) => {
        const newToken = res.data?.data?.accessToken
        if (!newToken) throw new Error('Refresh returned no token')
        useAuthStore.getState().setToken(newToken)
        return newToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

const onError = createResponseErrorHandler({
  retry: (config) => api(config),
  refresh: refreshAccessToken,
  onAuthFail: () => {
    useAuthStore.getState().logout()
    if (typeof window !== 'undefined') window.location.assign('/login')
  },
})

// --- Response: unwrap the standard { success, message, data, errors } shape ---
api.interceptors.response.use((response) => response.data?.data, onError)

export default api
