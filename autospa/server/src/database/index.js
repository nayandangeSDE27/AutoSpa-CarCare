import mongoose from 'mongoose'
import config from '../config/index.js'
import logger from '../utils/logger.js'
import dns from "node:dns";

// Use Cloudflare DNS
dns.setServers(["1.1.1.1", "1.0.0.1"]);
/**
 * Connect to MongoDB via Mongoose. Logs the outcome and exits the process
 * on failure — the server should not run without its database.
 */
export async function connectDB() {
  try {
    const conn = await mongoose.connect(config.mongoUri)
    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`)
    return conn
  } catch (error) {
    logger.error({ err: error }, 'MongoDB connection failed')
    process.exit(1)
  }
}

export default connectDB
