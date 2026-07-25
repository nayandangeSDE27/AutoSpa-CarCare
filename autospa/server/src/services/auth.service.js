import crypto from 'node:crypto'

import config from '../config/index.js'
import logger from '../utils/logger.js'
import redis from '../config/redis.js'
import ApiError from '../utils/ApiError.js'
import mailer from '../utils/mailer.js'
import userRepository from '../repositories/user.repository.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js'

/**
 * authService — ALL auth logic lives here. Talks to the repository and Redis.
 * No req/res, no Express concepts.
 */

// --- Redis key helpers ---
const refreshKey = (userId) => `auth:refresh:${userId}`
const verifyOtpKey = (email) => `auth:otp:verify:${email.toLowerCase()}`
const resetOtpKey = (email) => `auth:otp:reset:${email.toLowerCase()}`

// --- OTP helpers ---
function generateOtp() {
  // Always `length` digits, no leading-zero loss.
  const min = 10 ** (config.otp.length - 1)
  const max = 10 ** config.otp.length
  return String(crypto.randomInt(min, max))
}

async function issueOtp(key, purpose, email) {
  const otp = generateOtp()
  await redis.set(key, otp, 'EX', config.otp.ttlSeconds)
  // Always log for local dev; also send a real email when SMTP is configured.
  logger.info(`[OTP:${purpose}] ${email} -> ${otp} (valid ${config.otp.ttlSeconds}s)`)
  mailer
    .send({
      to: email,
      subject: `Your AutoSpa ${purpose} code`,
      text: `Your verification code is ${otp}. It expires in ${Math.round(config.otp.ttlSeconds / 60)} minutes.`,
    })
    .catch((err) => logger.error({ err }, 'Failed to send OTP email'))
  return otp
}

// --- Token helpers ---
async function issueTokens(user) {
  const payload = { userId: user.id, role: user.role }
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)
  // Store the active refresh token so it can be revoked; TTL matches expiry.
  await redis.set(refreshKey(user.id), refreshToken, 'EX', config.jwt.refreshTtlSeconds)
  return { accessToken, refreshToken }
}

// --- Use cases ---

async function register({ name, email, phone, password, role }) {
  const exists = await userRepository.existsByEmail(email)
  if (exists) {
    throw new ApiError(409, 'An account with this email already exists')
  }

  const user = await userRepository.create({ name, email, phone, password, role })
  await issueOtp(verifyOtpKey(email), 'verify-email', email)

  return user
}

async function verifyEmail({ email, otp }) {
  const stored = await redis.get(verifyOtpKey(email))
  if (!stored || stored !== otp) {
    throw new ApiError(400, 'Invalid or expired OTP')
  }

  const user = await userRepository.findByEmail(email)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const updated = await userRepository.updateById(user.id, { isEmailVerified: true })
  await redis.del(verifyOtpKey(email))
  return updated
}

async function resendOtp({ email }) {
  const user = await userRepository.findByEmail(email)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }
  if (user.isEmailVerified) {
    throw new ApiError(400, 'Email is already verified')
  }
  await issueOtp(verifyOtpKey(email), 'verify-email', email)
}

async function login({ email, password }) {
  const user = await userRepository.findByEmailWithPassword(email)
  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password')
  }

  if (user.status === 'blocked') {
    throw new ApiError(403, 'Your account has been blocked')
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, 'Please verify your email before logging in')
  }

  const tokens = await issueTokens(user)
  return { user, ...tokens }
}

async function logout(userId) {
  await redis.del(refreshKey(userId))
}

async function refreshAccessToken({ refreshToken }) {
  let payload
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token')
  }

  const stored = await redis.get(refreshKey(payload.userId))
  if (!stored || stored !== refreshToken) {
    // Token was revoked (logout) or doesn't match the active session.
    throw new ApiError(401, 'Refresh token has been revoked')
  }

  const accessToken = signAccessToken({ userId: payload.userId, role: payload.role })
  return { accessToken }
}

async function forgotPassword({ email }) {
  const user = await userRepository.findByEmail(email)
  // Only issue an OTP if the account exists, but always respond the same way
  // to avoid leaking which emails are registered.
  if (user) {
    await issueOtp(resetOtpKey(email), 'password-reset', email)
  }
}

async function resetPassword({ email, otp, newPassword }) {
  const stored = await redis.get(resetOtpKey(email))
  if (!stored || stored !== otp) {
    throw new ApiError(400, 'Invalid or expired reset code')
  }

  const user = await userRepository.findByEmail(email)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  // setFields uses save() so the pre-save hook re-hashes the password.
  await userRepository.setFields(user.id, { password: newPassword })
  await redis.del(resetOtpKey(email))
  // Revoke any active session so old refresh tokens stop working.
  await redis.del(refreshKey(user.id))
}

async function getCurrentUser(userId) {
  const user = await userRepository.findById(userId)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }
  return user
}

export default {
  register,
  verifyEmail,
  resendOtp,
  login,
  logout,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  getCurrentUser,
}
