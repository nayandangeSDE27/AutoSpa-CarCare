import dotenv from 'dotenv'

dotenv.config()

/**
 * Central configuration.
 * This is the ONLY module that reads process.env directly — everything else
 * imports the exported `config` object.
 */

const REQUIRED_ENV_VARS = [
  'MONGO_URI',
  'REDIS_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
]

const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]?.trim())

if (missing.length > 0) {
  // Logger isn't available yet at this point, so fail fast with console.
  console.error(
    `\n[config] Missing required environment variable(s): ${missing.join(', ')}\n` +
      `Add them to server/.env (see server/.env.example) before starting the server.\n`
  )
  process.exit(1)
}

/**
 * Parse a duration string like "15m", "7d", "30s", "2h" (or a raw number of
 * seconds) into seconds — used for Redis TTLs that must match JWT expiries.
 */
function toSeconds(value, fallbackSeconds) {
  if (value == null || value === '') return fallbackSeconds
  if (/^\d+$/.test(value)) return Number(value)
  const match = /^(\d+)\s*(s|m|h|d)$/.exec(String(value).trim())
  if (!match) return fallbackSeconds
  const n = Number(match[1])
  const unit = { s: 1, m: 60, h: 3600, d: 86400 }[match[2]]
  return n * unit
}

const env = process.env.NODE_ENV || 'development'

const accessExpiry = process.env.JWT_ACCESS_EXPIRY || '15m'
const refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d'

const config = {
  env,
  isProduction: env === 'production',
  isDevelopment: env !== 'production',
  port: Number(process.env.PORT) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  mongoUri: process.env.MONGO_URI,
  redisUrl: process.env.REDIS_URL,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry, // e.g. "15m" — passed to jsonwebtoken
    refreshExpiry, // e.g. "7d"  — passed to jsonwebtoken
    // Seconds, for Redis TTL on the stored refresh token.
    refreshTtlSeconds: toSeconds(refreshExpiry, 7 * 86400),
  },

  otp: {
    // Seconds an OTP stays valid in Redis.
    ttlSeconds: toSeconds(process.env.OTP_TTL, 600),
    length: 6,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    // Real uploads only when all three creds are present; otherwise mock.
    get enabled() {
      return Boolean(this.cloudName && this.apiKey && this.apiSecret)
    },
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    currency: process.env.STRIPE_CURRENCY || 'usd',
    get enabled() {
      return Boolean(this.secretKey)
    },
  },

  brevo: {
    apiKey: process.env.BREVO_API_KEY || '',
    fromEmail: process.env.BREVO_FROM_EMAIL || '',
    fromName: process.env.BREVO_FROM_NAME || 'AutoSpa',
    // Real email only when apiKey and fromEmail are present; otherwise mock (log).
    get enabled() {
      return Boolean(this.apiKey && this.fromEmail)
    },
  },

  jobs: {
    // How far ahead (hours) a booking reminder fires.
    reminderLeadHours: Number(process.env.REMINDER_LEAD_HOURS) || 24,
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window per IP
  },
}

export default config
