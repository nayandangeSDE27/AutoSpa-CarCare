import config from './index.js'
import logger from '../utils/logger.js'

/**
 * Shared Redis client (ioredis). Used for refresh-token storage/revocation
 * and short-lived OTPs. Connection string comes from config (REDIS_URL).
 *
 * Under NODE_ENV=test we swap in ioredis-mock (in-memory, same API) so the
 * whole suite runs with no real Redis and no credentials.
 */
let RedisImpl
if (config.env === 'test') {
  RedisImpl = (await import('ioredis-mock')).default
} else {
  RedisImpl = (await import('ioredis')).default
}

let redisUrl = config.redisUrl || ''
// Upstash requires TLS. If the URL points to Upstash but uses unprotected 'redis://', fix it.
if (redisUrl.includes('upstash.io') && redisUrl.startsWith('redis://')) {
  redisUrl = redisUrl.replace('redis://', 'rediss://')
}

const redisOptions = {
  lazyConnect: false,
  maxRetriesPerRequest: 3,
  family: 0, // Render-specific fix: Allow IPv4/IPv6 dual-stack resolution
}

const redis =
  config.env === 'test'
    ? new RedisImpl()
    : new RedisImpl(redisUrl, redisOptions)

if (config.env !== 'test') {
  redis.on('connect', () => logger.info('Redis connected'))
  redis.on('error', (err) => logger.error({ err }, 'Redis error'))
}

export default redis
