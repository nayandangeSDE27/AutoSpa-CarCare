import Booking, { ACTIVE_BOOKING_STATUSES } from '../models/booking.model.js'
import Counter from '../models/counter.model.js'

/**
 * bookingRepository — the ONLY module that touches the Booking / Counter models.
 * Several methods accept an optional Mongoose `session` so the booking-creation
 * transaction stays atomic.
 */

/**
 * Count ACTIVE bookings for a garage whose [startTime, endTime) window overlaps
 * the requested window. Overlap: existing.start < newEnd AND existing.end > newStart.
 */
function countOverlapping({ garageId, startTime, endTime, excludeId }, session = null) {
  const query = {
    garageId,
    status: { $in: ACTIVE_BOOKING_STATUSES },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  }
  if (excludeId) query._id = { $ne: excludeId }
  return Booking.countDocuments(query).session(session)
}

function create(data, session = null) {
  return Booking.create([data], { session }).then((docs) => docs[0])
}

/**
 * Atomically increment a per-day counter and return the next value.
 */
async function nextSequence(key, session = null) {
  const doc = await Counter.findByIdAndUpdate(
    key,
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  )
  return doc.seq
}

/**
 * Contention write on a shared per-(garage, day) document. Concurrent booking
 * transactions all write this same _id, so MongoDB raises a WriteConflict and
 * serializes them — the retried transaction then re-counts against committed
 * data. This is what makes the "count then create" check race-safe.
 */
function touchGarageDayLock(garageId, dateKey, session) {
  return Counter.findByIdAndUpdate(
    `slotlock:${garageId}:${dateKey}`,
    { $inc: { seq: 1 } },
    { upsert: true, new: true, session }
  )
}

function findById(id) {
  return Booking.findById(id)
}

function findByCustomer(customerId, filter = {}) {
  return Booking.find({ customerId, ...filter }).sort({ startTime: 1 })
}

function findByGarage(garageId, filter = {}) {
  return Booking.find({ garageId, ...filter }).sort({ startTime: 1 })
}

// Garage-owner views need the customer + car + worker details.
const OWNER_POPULATE = [
  { path: 'customerId', select: 'name phone email' },
  { path: 'carId', select: 'make model licensePlate color year fuelType' },
  { path: 'workerId', select: 'name status' },
]

function findByGaragePopulated(garageId, filter = {}) {
  return Booking.find({ garageId, ...filter }).sort({ createdAt: -1 }).populate(OWNER_POPULATE)
}

function findByIdPopulated(id) {
  return Booking.findById(id).populate(OWNER_POPULATE)
}

function countByGarage(garageId, filter = {}) {
  return Booking.countDocuments({ garageId, ...filter })
}

/**
 * Sum totalAmount for bookings matching a filter (e.g. today's COMPLETED).
 */
async function sumAmount(garageId, filter = {}) {
  const match = { ...filter }
  if (garageId) match.garageId = garageId // omit for platform-wide totals
  const [row] = await Booking.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ])
  return row?.total || 0
}

// ----- Admin: platform-wide paginated listing + aggregates -----

async function findPaginated(filter = {}, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Booking.countDocuments(filter),
  ])
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 0 }
}

function count(filter = {}) {
  return Booking.countDocuments(filter)
}

async function countByStatus() {
  const rows = await Booking.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }])
  return Object.fromEntries(rows.map((r) => [r._id, r.count]))
}

// Admin: bookings grouped by garage / customer (for enriched list columns).
function countGroupedByGarage() {
  return Booking.aggregate([{ $group: { _id: '$garageId', count: { $sum: 1 } } }])
}
function countGroupedByCustomer() {
  return Booking.aggregate([{ $group: { _id: '$customerId', count: { $sum: 1 } } }])
}

const ADMIN_POPULATE = [
  { path: 'customerId', select: 'name email' },
  { path: 'garageId', select: 'name address' },
]
async function findPaginatedPopulated(filter = {}, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate(ADMIN_POPULATE),
    Booking.countDocuments(filter),
  ])
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 0 }
}

// Active bookings starting within [from, to] that haven't been reminded yet.
function findRemindable(from, to) {
  return Booking.find({
    status: { $in: ACTIVE_BOOKING_STATUSES },
    startTime: { $gte: from, $lte: to },
    reminderSent: false,
  })
}

// Completed bookings that haven't had a follow-up notification yet.
function findFollowUps() {
  return Booking.find({ status: 'COMPLETED', followUpSent: false })
}

function countTodayJobsForWorker(workerId, dayStart, dayEnd) {
  return Booking.countDocuments({
    workerId,
    bookingDate: { $gte: dayStart, $lt: dayEnd },
    status: { $in: ACTIVE_BOOKING_STATUSES },
  })
}

function updateById(id, update, session = null) {
  return Booking.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
    session,
  })
}

export default {
  countOverlapping,
  create,
  nextSequence,
  touchGarageDayLock,
  findById,
  findByCustomer,
  findByGarage,
  findByGaragePopulated,
  findByIdPopulated,
  countByGarage,
  sumAmount,
  countTodayJobsForWorker,
  findPaginated,
  findPaginatedPopulated,
  count,
  countByStatus,
  countGroupedByGarage,
  countGroupedByCustomer,
  findRemindable,
  findFollowUps,
  updateById,
}
