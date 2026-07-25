import config from '../config/index.js'
import logger from '../utils/logger.js'
import redis from '../config/redis.js'
import { verifyRefreshToken } from '../utils/jwt.js'
import bookingRepository from '../repositories/booking.repository.js'
import userRepository from '../repositories/user.repository.js'
import analyticsRepository from '../repositories/analytics.repository.js'
import notificationService from './../services/notification.service.js'
import settingsService from '../services/settings.service.js'

/**
 * Background jobs (CLAUDE.md section 10). Each is a plain async function so tests
 * can invoke it directly; the scheduler in ./scheduler.js wires the cron times.
 */

function dayRangeUtc(base = new Date()) {
  const start = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()))
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return { start, end }
}

// 1. Booking reminders — notify customers before an upcoming booking.
export async function sendBookingReminders(now = new Date()) {
  const to = new Date(now.getTime() + config.jobs.reminderLeadHours * 60 * 60 * 1000)
  const bookings = await bookingRepository.findRemindable(now, to)
  for (const b of bookings) {
    // eslint-disable-next-line no-await-in-loop
    await notificationService.notify(b.customerId, {
      event: 'bookingReminder',
      title: 'Upcoming booking reminder',
      message: `Reminder: your booking ${b.bookingNumber} is coming up.`,
      relatedType: 'Booking',
      relatedId: b._id,
    })
    // eslint-disable-next-line no-await-in-loop
    await bookingRepository.updateById(b._id, { reminderSent: true })
  }
  logger.info(`[cron] sendBookingReminders: ${bookings.length} reminder(s) sent`)
  return bookings.length
}

// 2. Daily analytics rollup — persist a snapshot and notify admins.
export async function dailyAnalyticsRollup(base = new Date()) {
  const { start, end } = dayRangeUtc(base)
  const dateStr = start.toISOString().slice(0, 10)
  const dateFilter = { bookingDate: { $gte: start, $lt: end } }
  const settings = await settingsService.getSettings()

  const [totalBookings, completedBookings, revenue, newUsers] = await Promise.all([
    bookingRepository.count(dateFilter),
    bookingRepository.count({ ...dateFilter, status: 'COMPLETED' }),
    bookingRepository.sumAmount(undefined, { ...dateFilter, status: 'COMPLETED', paymentStatus: 'PAID' }),
    userRepository.count({ createdAt: { $gte: start, $lt: end } }),
  ])
  const commission = Math.round(revenue * settings.commissionRate * 100) / 100

  const snapshot = await analyticsRepository.upsertSnapshot(dateStr, {
    totalBookings,
    completedBookings,
    revenue,
    commission,
    newUsers,
  })

  await notificationService.notifyAdmins({
    event: 'newReport',
    title: 'Daily report ready',
    message: `Report for ${dateStr}: ${totalBookings} bookings, revenue ${revenue}.`,
    relatedType: 'Analytics',
    relatedId: snapshot._id,
  })

  logger.info(`[cron] dailyAnalyticsRollup: snapshot ${dateStr} written`)
  return snapshot
}

// 3. Clean expired/invalid refresh tokens from Redis.
export async function cleanExpiredRefreshTokens() {
  const keys = await redis.keys('auth:refresh:*')
  let removed = 0
  for (const key of keys) {
    // eslint-disable-next-line no-await-in-loop
    const token = await redis.get(key)
    let valid = false
    try {
      if (token) {
        verifyRefreshToken(token)
        valid = true
      }
    } catch {
      valid = false
    }
    if (!valid) {
      // eslint-disable-next-line no-await-in-loop
      await redis.del(key)
      removed += 1
    }
  }
  logger.info(`[cron] cleanExpiredRefreshTokens: removed ${removed} of ${keys.length}`)
  return removed
}

// 4. Follow-up notification after COMPLETED bookings.
export async function sendCompletionFollowUps() {
  const bookings = await bookingRepository.findFollowUps()
  for (const b of bookings) {
    // eslint-disable-next-line no-await-in-loop
    await notificationService.notify(b.customerId, {
      event: 'notificationReceived',
      title: 'How was your service?',
      message: `Thanks for using AutoSpa! Please leave a review for booking ${b.bookingNumber}.`,
      relatedType: 'Booking',
      relatedId: b._id,
    })
    // eslint-disable-next-line no-await-in-loop
    await bookingRepository.updateById(b._id, { followUpSent: true })
  }
  logger.info(`[cron] sendCompletionFollowUps: ${bookings.length} follow-up(s) sent`)
  return bookings.length
}

export default {
  sendBookingReminders,
  dailyAnalyticsRollup,
  cleanExpiredRefreshTokens,
  sendCompletionFollowUps,
}
