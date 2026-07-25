import jwt from 'jsonwebtoken'
import config from '../config/index.js'

/**
 * Low-level JWT primitives. All auth logic (deciding what to sign, checking
 * against Redis, etc.) lives in authService — this just signs/verifies.
 */

export function signAccessToken(payload) {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
  })
}

export function signRefreshToken(payload) {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, config.jwt.accessSecret)
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, config.jwt.refreshSecret)
}
