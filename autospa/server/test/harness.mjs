import http from 'node:http'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import mongoose from 'mongoose'

/**
 * Boots the real Express app against a throwaway in-memory MongoDB replica set
 * (needed for transactions) and an in-memory Redis mock. No Docker, no .env,
 * no credentials. Env vars are set in-process only, before any src import.
 */
export async function startHarness() {
  const replset = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  })
  const uri = replset.getUri('autospa_test')

  process.env.NODE_ENV = 'test'
  process.env.MONGO_URI = uri
  process.env.REDIS_URL = 'redis://mock:6379' // ignored by ioredis-mock
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-000000000000000000000000'
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-00000000000000000000000'
  process.env.JWT_ACCESS_EXPIRY = '15m'
  process.env.JWT_REFRESH_EXPIRY = '7d'
  process.env.OTP_TTL = '600'
  process.env.PORT = '5100'

  // Import AFTER env is set so config + redis pick up test settings.
  const { default: app } = await import('../src/app.js')
  const { default: redis } = await import('../src/config/redis.js')
  const { default: config } = await import('../src/config/index.js')
  const realtime = await import('../src/realtime/index.js')
  const { default: mailer } = await import('../src/utils/mailer.js')

  await mongoose.connect(config.mongoUri)

  // Real HTTP server + Socket.IO so live socket auth can be exercised too.
  const server = http.createServer(app)
  realtime.initSocket(server)
  await new Promise((resolve) => server.listen(5100, resolve))

  const baseUrl = 'http://localhost:5100/api'

  async function stop() {
    await new Promise((resolve) => server.close(resolve))
    await mongoose.disconnect()
    if (typeof redis.quit === 'function') await redis.quit().catch(() => {})
    await replset.stop()
  }

  async function resetDb() {
    const { collections } = mongoose.connection
    await Promise.all(Object.values(collections).map((c) => c.deleteMany({})))
    await redis.flushall()
    realtime.clearTestSink()
    mailer.clearMailSink()
  }

  return { baseUrl, redis, mongoose, config, stop, resetDb, realtime, mailer }
}
