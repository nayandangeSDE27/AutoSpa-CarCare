import { Server } from 'socket.io'

import config from '../config/index.js'
import logger from '../utils/logger.js'
import { verifyAccessToken } from '../utils/jwt.js'

/**
 * Socket.IO realtime layer (CLAUDE.md section 9).
 * - Authenticates each connection with the JWT access token.
 * - Joins each user to a private room keyed by their userId.
 * - Services emit via emitToUser(); logic is never duplicated here.
 *
 * In NODE_ENV=test every emit is also recorded in an in-process sink so tests
 * can assert emissions deterministically without socket timing.
 */
let io = null
const testSink = []

const roomFor = (userId) => `user:${userId}`

export function initSocket(httpServer) {
  io = new Server(httpServer, { cors: { origin: config.clientUrl, credentials: true } })

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token
    if (!token) return next(new Error('Authentication required'))
    try {
      const payload = verifyAccessToken(token)
      socket.userId = payload.userId
      socket.role = payload.role
      return next()
    } catch {
      return next(new Error('Invalid or expired token'))
    }
  })

  io.on('connection', (socket) => {
    socket.join(roomFor(socket.userId))
    logger.debug(`socket connected: user ${socket.userId}`)
  })

  return io
}

/**
 * Emit an event to a single user's room. Safe to call before/without a live
 * server (no-op on io, still records to the test sink).
 */
export function emitToUser(userId, event, payload = {}) {
  if (!userId) return
  const uid = String(userId)
  if (config.env === 'test') testSink.push({ userId: uid, event, payload })
  if (io) io.to(roomFor(uid)).emit(event, payload)
}

export function getIo() {
  return io
}

// ---- test helpers ----
export function getTestSink() {
  return testSink
}
export function clearTestSink() {
  testSink.length = 0
}
