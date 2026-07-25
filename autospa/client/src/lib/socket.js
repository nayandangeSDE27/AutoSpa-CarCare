import { io } from 'socket.io-client'

/**
 * Single Socket.IO client for the whole app. Connects to VITE_API_URL's origin
 * with the JWT access token in the handshake auth (matching the backend). One
 * shared instance so listeners survive reconnects and there are no leaks.
 */
const ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '')

let socket = null
let currentToken = null

export function getSocket() {
  if (!socket) {
    socket = io(ORIGIN, {
      autoConnect: false,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
    })
  }
  return socket
}

/**
 * Connect (or reconnect) with a token. If the token rotated (refresh), we
 * reconnect so the handshake carries the new one.
 */
export function connectSocket(token) {
  if (!token) return
  const s = getSocket()
  if (s.connected && currentToken === token) return
  currentToken = token
  s.auth = { token }
  if (s.connected) s.disconnect()
  s.connect()
}

export function disconnectSocket() {
  currentToken = null
  if (socket) {
    socket.auth = {}
    socket.disconnect()
  }
}
