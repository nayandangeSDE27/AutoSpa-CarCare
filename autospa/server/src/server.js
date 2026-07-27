import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");
import http from 'node:http'

import config from './config/index.js'
import logger from './utils/logger.js'
import connectDB from './database/index.js'
import './config/redis.js' // initialize Redis connection
import app from './app.js'
import { initSocket } from './realtime/index.js'
import { startCronJobs } from './jobs/scheduler.js'

/**
 * Production entry point: connect to MongoDB, attach Socket.IO, start cron,
 * then listen.
 */
const start = async () => {
  await connectDB()

  const server = http.createServer(app)
  initSocket(server)

  server.listen(config.port, () => {
    logger.info(`AutoSpa server listening on http://localhost:${config.port} [${config.env}]`)
    startCronJobs()
  })
}

start()

export default app
