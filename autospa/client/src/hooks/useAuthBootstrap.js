import { useEffect, useState } from 'react'

import { authApi } from '../api/auth.api.js'
import { useAuthStore } from '../stores/auth.store.js'

/**
 * On app load, if a persisted session (access token) exists, fetch the current
 * user via GET /auth/me to rehydrate the store. Returns { ready } so the app can
 * hold rendering until bootstrap settles.
 */
export function useAuthBootstrap() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const { accessToken, setUser, logout } = useAuthStore.getState()

    if (!accessToken) {
      setReady(true)
      return () => {}
    }

    authApi
      .me()
      .then((data) => {
        if (!cancelled) setUser(data.user)
      })
      .catch(() => {
        // Token invalid/expired and refresh failed — clear the session.
        if (!cancelled) logout()
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return { ready }
}

export default useAuthBootstrap
