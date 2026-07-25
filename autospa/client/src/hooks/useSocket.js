import { useEffect, useRef } from 'react'

import { getSocket, connectSocket, disconnectSocket } from '../lib/socket.js'
import { useAuthStore } from '../stores/auth.store.js'

/**
 * Drives the socket lifecycle from auth state: connect when authenticated,
 * reconnect when the access token rotates, disconnect on logout. Mount once
 * at the app root.
 */
export function useSocketConnection() {
  const token = useAuthStore((s) => s.accessToken)
  const isAuth = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (isAuth && token) connectSocket(token)
    else disconnectSocket()
  }, [isAuth, token])
}

/**
 * Subscribe to a socket event for the lifetime of the component. Uses a ref so
 * the latest handler runs without re-subscribing on every render, and cleans up
 * on unmount — no duplicate listeners, no leaks.
 */
export function useSocketEvent(event, handler) {
  const ref = useRef(handler)
  ref.current = handler

  useEffect(() => {
    if (!event) return undefined
    const s = getSocket()
    const fn = (payload) => ref.current?.(payload)
    s.on(event, fn)
    return () => s.off(event, fn)
  }, [event])
}
