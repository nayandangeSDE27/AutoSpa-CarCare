import cron from 'node-cron'

import logger from '../utils/logger.js'
import jobs from './index.js'

/**
 * Wire cron schedules to the job functions. Called once from server.js on boot.
 * Errors in a job are logged, never crash the process.
 */
const run = (name, fn) => async () => {
  try {
    await fn()
  } catch (err) {
    logger.error({ err }, `[cron] ${name} failed`)
  }
}

export function startCronJobs() {
  // Every 15 minutes: upcoming booking reminders.
  cron.schedule('*/15 * * * *', run('sendBookingReminders', jobs.sendBookingReminders))
  // Daily at 00:10 UTC: analytics rollup for the day.
  cron.schedule('10 0 * * *', run('dailyAnalyticsRollup', jobs.dailyAnalyticsRollup))
  // Hourly: prune expired refresh tokens from Redis.
  cron.schedule('0 * * * *', run('cleanExpiredRefreshTokens', jobs.cleanExpiredRefreshTokens))
  // Every 30 minutes: follow-ups for completed bookings.
  cron.schedule('*/30 * * * *', run('sendCompletionFollowUps', jobs.sendCompletionFollowUps))

  logger.info('[cron] scheduled jobs registered')
}

export default { startCronJobs }
