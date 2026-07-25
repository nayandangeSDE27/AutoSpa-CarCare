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

const redis =
  config.env === 'test'
    ? new RedisImpl()
    : new RedisImpl(config.redisUrl, { lazyConnect: false, maxRetriesPerRequest: 3 })

if (config.env !== 'test') {
  redis.on('connect', () => logger.info('Redis connected'))
  redis.on('error', (err) => logger.error({ err }, 'Redis error'))
}

export default redis
