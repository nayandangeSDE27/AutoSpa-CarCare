import mongoose from 'mongoose'

import Booking from '../models/booking.model.js'
import Payment from '../models/payment.model.js'
import Garage from '../models/garage.model.js'
import AnalyticsSnapshot from '../models/analyticsSnapshot.model.js'

/**
 * analyticsRepository — a read-model / reporting boundary. Because analytics are
 * inherently cross-collection aggregations, this module is allowed to query
 * several models via MongoDB aggregation pipelines (read-only).
 */

const oid = (id) => new mongoose.Types.ObjectId(id)
const dayGroup = (field) => ({ $dateToString: { format: '%Y-%m-%d', date: `$${field}`, timezone: 'UTC' } })

// ---- Garage analytics ----
function garageRevenueOverTime(garageId) {
  return Payment.aggregate([
    { $match: { garageId: oid(garageId), status: 'PAID' } },
    { $group: { _id: dayGroup('createdAt'), revenue: { $sum: '$amount' }, earnings: { $sum: '$garageEarnings' }, commission: { $sum: '$commission' }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', revenue: 1, earnings: 1, commission: 1, count: 1 } },
  ])
}

function garageBookingsByStatus(garageId) {
  return Booking.aggregate([
    { $match: { garageId: oid(garageId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { _id: 0, status: '$_id', count: 1 } },
    { $sort: { status: 1 } },
  ])
}

function garageTopServices(garageId, limit = 5) {
  return Booking.aggregate([
    { $match: { garageId: oid(garageId) } },
    { $unwind: '$services' },
    { $group: { _id: '$services.nameAtBooking', bookings: { $sum: 1 }, revenue: { $sum: '$services.priceAtBooking' } } },
    { $sort: { bookings: -1 } },
    { $limit: limit },
    { $project: { _id: 0, service: '$_id', bookings: 1, revenue: 1 } },
  ])
}

/**
 * Count bookings split by bookingType (ONLINE vs WALK_IN) for a given garage.
 * Returns an object like { ONLINE: 12, WALK_IN: 4 }.
 */
async function garageBookingsByType(garageId) {
  const rows = await Booking.aggregate([
    { $match: { garageId: oid(garageId) } },
    { $group: { _id: '$bookingType', count: { $sum: 1 } } },
  ])
  return rows.reduce((acc, r) => ({ ...acc, [r._id || 'ONLINE']: r.count }), { ONLINE: 0, WALK_IN: 0 })
}

// ---- Admin analytics ----
function platformRevenueOverTime() {
  return Payment.aggregate([
    { $match: { status: 'PAID' } },
    { $group: { _id: dayGroup('createdAt'), revenue: { $sum: '$amount' }, commission: { $sum: '$commission' } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', revenue: 1, commission: 1 } },
  ])
}

function garagesByStatus() {
  return Garage.aggregate([
    { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
    { $project: { _id: 0, status: '$_id', count: 1 } },
    { $sort: { status: 1 } },
  ])
}

function bookingsTrend() {
  return Booking.aggregate([
    { $group: { _id: dayGroup('bookingDate'), count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', count: 1 } },
  ])
}

// ---- Daily snapshot (cron) ----
function upsertSnapshot(date, data) {
  return AnalyticsSnapshot.findOneAndUpdate({ date }, { $set: { date, ...data } }, { new: true, upsert: true })
}

function listSnapshots(limit = 30) {
  return AnalyticsSnapshot.find({}).sort({ date: -1 }).limit(limit)
}

export default {
  garageRevenueOverTime,
  garageBookingsByStatus,
  garageTopServices,
  garageBookingsByType,
  platformRevenueOverTime,
  garagesByStatus,
  bookingsTrend,
  upsertSnapshot,
  listSnapshots,
}
