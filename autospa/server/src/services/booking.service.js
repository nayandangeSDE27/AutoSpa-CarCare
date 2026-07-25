import crypto from 'node:crypto'
import mongoose from 'mongoose'

import ApiError from '../utils/ApiError.js'
import logger from '../utils/logger.js'
import { ACTIVE_BOOKING_STATUSES } from '../models/booking.model.js'
import bookingRepository from '../repositories/booking.repository.js'
import carRepository from '../repositories/car.repository.js'
import garageRepository from '../repositories/garage.repository.js'
import workerRepository from '../repositories/worker.repository.js'
import notificationService from './notification.service.js'
import { resolveServices } from './slot.service.js'
import PRICING from '../config/pricing.js'

/**
 * Legal booking status transitions (CLAUDE.md section 8 state machine).
 */
const LEGAL_TRANSITIONS = {
  PENDING: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['WORKER_ASSIGNED', 'CANCELLED'],
  WORKER_ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  REJECTED: [],
  NO_SHOW: [],
}

function assertTransition(current, next) {
  const allowed = LEGAL_TRANSITIONS[current] || []
  if (!allowed.includes(next)) {
    throw new ApiError(400, `Illegal status transition: ${current} → ${next}`)
  }
}

// Build an update patch that also keeps the derived isActive flag correct
// (findByIdAndUpdate does not run the pre-validate hook).
function statusPatch(next, extra = {}) {
  return { status: next, isActive: ACTIVE_BOOKING_STATUSES.includes(next), ...extra }
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000))
}

/**
 * bookingService — all booking logic, including the concurrency-safe creation
 * transaction. No req/res here.
 */

const dateKey = (d) => d.toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD

async function assertOwnedCar(carId, customerId) {
  const car = await carRepository.findById(carId)
  if (!car || car.owner.toString() !== customerId.toString()) {
    throw new ApiError(404, 'Car not found')
  }
  return car
}

function buildBookingPayload({
  bookingNumber,
  customerId,
  carId = null,
  garageId,
  services,
  start,
  end,
  bookingDate,
  subtotalAmount,
  taxAmount,
  totalAmount,
  bookingType,
  status = 'PENDING',
  serviceOtp = '',
  customerName = '',
  customerPhone = '',
  vehicleRegistrationNumber = '',
  vehicleBrand = '',
  vehicleModel = '',
  vehicleType = '',
  notes = '',
}) {
  return {
    bookingNumber,
    customerId,
    carId,
    garageId,
    services,
    bookingDate,
    startTime: start,
    endTime: end,
    status,
    bookingType,
    serviceOtp,
    customerName,
    customerPhone,
    vehicleRegistrationNumber,
    vehicleBrand,
    vehicleModel,
    vehicleType,
    notes,
    subtotalAmount,
    taxAmount,
    totalAmount,
    paymentStatus: 'PENDING',
    workerId: null,
  }
}

async function getOwnedBookingOrThrow(bookingId, customerId) {
  const booking = await bookingRepository.findById(bookingId)
  if (!booking || booking.customerId.toString() !== customerId.toString()) {
    throw new ApiError(404, 'Booking not found')
  }
  return booking
}

/**
 * Create a booking. CONCURRENCY-SAFE: inside a transaction we take a contention
 * lock on the garage-day, recompute the window, count overlapping ACTIVE
 * bookings, and reject if the garage's bays are full — otherwise create.
 */
async function createBooking(customerId, { carId, garageId, serviceIds, startTime }) {
  await assertOwnedCar(carId, customerId)

  const garage = await garageRepository.findApprovedById(garageId)
  if (!garage) {
    throw new ApiError(404, 'Garage not found')
  }

  const { services, totalDuration } = await resolveServices(garageId, serviceIds)

  const start = new Date(startTime)
  if (Number.isNaN(start.getTime())) {
    throw new ApiError(400, 'Invalid startTime')
  }
  const end = new Date(start.getTime() + totalDuration * 60_000)
  const bookingDate = new Date(`${start.toISOString().slice(0, 10)}T00:00:00.000Z`)

  const snapshots = services.map((s) => ({
    serviceId: s._id,
    nameAtBooking: s.name,
    priceAtBooking: s.price,
    durationAtBooking: s.durationMinutes,
  }))
  const subtotalAmount = snapshots.reduce((sum, s) => sum + s.priceAtBooking, 0)
  const taxAmount = Math.round(subtotalAmount * PRICING.GST_RATE * 100) / 100
  const totalAmount = Math.round((subtotalAmount + taxAmount) * 100) / 100

  const isAutoAccept = garage.autoAcceptBookings === true
  const initialStatus = isAutoAccept ? 'ACCEPTED' : 'PENDING'
  const initialOtp = isAutoAccept ? generateOtp() : ''

  let created
  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      // Serialize concurrent bookings for this garage-day (see repository).
      await bookingRepository.touchGarageDayLock(garageId, dateKey(bookingDate), session)

      const overlapping = await bookingRepository.countOverlapping(
        { garageId, startTime: start, endTime: end },
        session
      )
      if (overlapping >= garage.serviceBays) {
        throw new ApiError(409, 'No available service bays for the selected time slot')
      }

      const seq = await bookingRepository.nextSequence(`booking-${dateKey(bookingDate)}`, session)
      const bookingNumber = `ASP-${dateKey(bookingDate)}-${String(seq).padStart(4, '0')}`

      created = await bookingRepository.create(
        buildBookingPayload({
          bookingNumber,
          customerId,
          carId,
          garageId,
          services: snapshots,
          start,
          end,
          bookingDate,
          subtotalAmount,
          taxAmount,
          totalAmount,
          bookingType: 'ONLINE',
          status: initialStatus,
          serviceOtp: initialOtp,
          customerName: '',
          customerPhone: '',
          vehicleRegistrationNumber: '',
          vehicleBrand: '',
          vehicleModel: '',
          vehicleType: '',
          notes: '',
        }),
        session
      )
    })
  } finally {
    await session.endSession()
  }

  if (isAutoAccept) {
    logger.info(`Auto-accepting booking ${created.bookingNumber} for garage ${garageId}`)
    await notificationService.notify(customerId, {
      event: 'bookingAccepted',
      title: 'Booking confirmed',
      message: `Your booking at ${garage.name} has been auto-accepted.`,
      relatedType: 'Booking',
      relatedId: created._id,
    })
    if (garage.owner) {
      await notificationService.notify(garage.owner, {
        event: 'bookingAutoAccepted',
        title: 'Auto-accepted booking',
        message: `New booking ${created.bookingNumber} received and automatically accepted.`,
        relatedType: 'Booking',
        relatedId: created._id,
      })
    }
  } else {
    // Notify the garage owner of the new pending booking.
    if (garage.owner) {
      await notificationService.notify(garage.owner, {
        event: 'newBooking',
        title: 'New booking',
        message: `New booking ${created.bookingNumber} received.`,
        relatedType: 'Booking',
        relatedId: created._id,
      })
    }
  }

  return created
}

async function createWalkInBooking(ownerId, payload) {
  const garage = await garageRepository.findByOwner(ownerId)
  if (!garage) {
    throw new ApiError(404, 'Garage not found')
  }

  const { serviceIds, bookingDate, estimatedStartTime, customerName, customerPhone, vehicleRegistrationNumber, vehicleBrand, vehicleModel, vehicleType, notes } = payload
  const { services, totalDuration } = await resolveServices(garage._id, serviceIds)

  const [year, month, day] = bookingDate.split('-').map(Number)
  const [hour, minute] = estimatedStartTime.split(':').map(Number)
  const start = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0))
  if (Number.isNaN(start.getTime())) {
    throw new ApiError(400, 'Invalid bookingDate or estimatedStartTime')
  }
  const end = new Date(start.getTime() + totalDuration * 60_000)
  const bookingDateValue = new Date(`${bookingDate}T00:00:00.000Z`)

  const snapshots = services.map((s) => ({
    serviceId: s._id,
    nameAtBooking: s.name,
    priceAtBooking: s.price,
    durationAtBooking: s.durationMinutes,
  }))
  const subtotalAmount = snapshots.reduce((sum, s) => sum + s.priceAtBooking, 0)
  const taxAmount = Math.round(subtotalAmount * PRICING.GST_RATE * 100) / 100
  const totalAmount = Math.round((subtotalAmount + taxAmount) * 100) / 100

  let created
  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      await bookingRepository.touchGarageDayLock(garage._id, dateKey(bookingDateValue), session)
      const overlapping = await bookingRepository.countOverlapping(
        { garageId: garage._id, startTime: start, endTime: end },
        session
      )
      if (overlapping >= garage.serviceBays) {
        throw new ApiError(409, 'No available service bays for the selected time slot')
      }

      const seq = await bookingRepository.nextSequence(`booking-${dateKey(bookingDateValue)}`, session)
      const bookingNumber = `ASP-${dateKey(bookingDateValue)}-${String(seq).padStart(4, '0')}`

      created = await bookingRepository.create(
        buildBookingPayload({
          bookingNumber,
          customerId: ownerId,
          garageId: garage._id,
          services: snapshots,
          start,
          end,
          bookingDate: bookingDateValue,
          subtotalAmount,
          taxAmount,
          totalAmount,
          bookingType: 'WALK_IN',
          status: 'ACCEPTED',
          serviceOtp: '',
          customerName,
          customerPhone,
          vehicleRegistrationNumber,
          vehicleBrand,
          vehicleModel,
          vehicleType,
          notes,
        }),
        session
      )
    })
  } finally {
    await session.endSession()
  }

  await notificationService.notify(ownerId, {
    event: 'newBooking',
    title: 'Walk-in booking created',
    message: `Walk-in booking ${created.bookingNumber} was created.`,
    relatedType: 'Booking',
    relatedId: created._id,
  })

  return created
}

function listBookings(customerId) {
  return bookingRepository.findByCustomer(customerId)
}

function listUpcoming(customerId) {
  return bookingRepository.findByCustomer(customerId, {
    status: { $in: ACTIVE_BOOKING_STATUSES },
    startTime: { $gte: new Date() },
  })
}

function getBooking(bookingId, customerId) {
  return getOwnedBookingOrThrow(bookingId, customerId)
}

async function cancelBooking(bookingId, customerId) {
  const booking = await getOwnedBookingOrThrow(bookingId, customerId)
  if (!ACTIVE_BOOKING_STATUSES.includes(booking.status)) {
    throw new ApiError(400, `Cannot cancel a booking that is ${booking.status}`)
  }
  const updated = await bookingRepository.updateById(bookingId, {
    status: 'CANCELLED',
    isActive: false,
  })
  // Notify the garage owner that a booking was cancelled.
  const garage = await garageRepository.findById(booking.garageId)
  if (garage?.owner) {
    await notificationService.notify(garage.owner, {
      event: 'bookingCancelled',
      title: 'Booking cancelled',
      message: `Booking ${booking.bookingNumber} was cancelled by the customer.`,
      relatedType: 'Booking',
      relatedId: booking._id,
    })
  }
  return updated
}

/**
 * Reschedule to a new startTime, keeping the same services. Re-runs the same
 * concurrency-safe window check (excluding this booking itself).
 */
async function rescheduleBooking(bookingId, customerId, { startTime }) {
  const booking = await getOwnedBookingOrThrow(bookingId, customerId)
  if (!ACTIVE_BOOKING_STATUSES.includes(booking.status)) {
    throw new ApiError(400, `Cannot reschedule a booking that is ${booking.status}`)
  }

  const garage = await garageRepository.findById(booking.garageId)
  if (!garage) {
    throw new ApiError(404, 'Garage not found')
  }

  const totalDuration = booking.services.reduce((sum, s) => sum + s.durationAtBooking, 0)
  const start = new Date(startTime)
  if (Number.isNaN(start.getTime())) {
    throw new ApiError(400, 'Invalid startTime')
  }
  const end = new Date(start.getTime() + totalDuration * 60_000)
  const bookingDate = new Date(`${start.toISOString().slice(0, 10)}T00:00:00.000Z`)

  let updated
  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      await bookingRepository.touchGarageDayLock(booking.garageId, dateKey(bookingDate), session)

      const overlapping = await bookingRepository.countOverlapping(
        { garageId: booking.garageId, startTime: start, endTime: end, excludeId: booking._id },
        session
      )
      if (overlapping >= garage.serviceBays) {
        throw new ApiError(409, 'No available service bays for the selected time slot')
      }

      updated = await bookingRepository.updateById(
        bookingId,
        { startTime: start, endTime: end, bookingDate },
        session
      )
    })
  } finally {
    await session.endSession()
  }

  return updated
}

// ===================== GARAGE-OWNER BOOKING MANAGEMENT =====================

/**
 * Load a booking and assert it belongs to a garage owned by this owner.
 */
async function getGarageBookingOrThrow(bookingId, ownerId) {
  const booking = await bookingRepository.findById(bookingId)
  if (!booking) {
    throw new ApiError(404, 'Booking not found')
  }
  const garage = await garageRepository.findById(booking.garageId)
  if (!garage || garage.owner?.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'You can only manage bookings for your own garage')
  }
  return booking
}

async function listGarageBookings(ownerId) {
  const garage = await garageRepository.findByOwner(ownerId)
  if (!garage) return []
  return bookingRepository.findByGaragePopulated(garage._id)
}

async function listGarageWalkInBookings(ownerId) {
  const garage = await garageRepository.findByOwner(ownerId)
  if (!garage) return []
  return bookingRepository.findByGaragePopulated(garage._id, { bookingType: 'WALK_IN' })
}

async function getGarageBooking(bookingId, ownerId) {
  await getGarageBookingOrThrow(bookingId, ownerId) // ownership check
  return bookingRepository.findByIdPopulated(bookingId)
}

/**
 * Drive a status transition (PATCH /:id/status). Enforces legal transitions.
 * On ACCEPTED, generates the 6-digit serviceOtp and logs it (simulating
 * notifying the customer). Transitions needing extra data (WORKER_ASSIGNED via
 * assign-worker, IN_PROGRESS via start) must use their dedicated endpoints.
 */
async function updateBookingStatus(bookingId, ownerId, nextStatus) {
  const booking = await getGarageBookingOrThrow(bookingId, ownerId)
  assertTransition(booking.status, nextStatus)

  if (nextStatus === 'WORKER_ASSIGNED' || nextStatus === 'IN_PROGRESS') {
    throw new ApiError(400, `Use the dedicated endpoint to move to ${nextStatus}`)
  }

  const extra = {}
  if (nextStatus === 'ACCEPTED') {
    const otp = generateOtp()
    extra.serviceOtp = otp
    logger.info(`[serviceOtp] booking ${booking.bookingNumber} accepted -> OTP ${otp} (customer notified)`)
  }

  const updated = await bookingRepository.updateById(bookingId, statusPatch(nextStatus, extra))

  if (nextStatus === 'ACCEPTED') {
    await notificationService.notify(booking.customerId, {
      event: 'bookingAccepted',
      title: 'Booking accepted',
      message: `Your booking ${booking.bookingNumber} was accepted. Your service OTP is ${extra.serviceOtp}.`,
      relatedType: 'Booking',
      relatedId: booking._id,
    })
  } else if (nextStatus === 'REJECTED') {
    await notificationService.notify(booking.customerId, {
      event: 'bookingRejected',
      title: 'Booking rejected',
      message: `Your booking ${booking.bookingNumber} was rejected.`,
      relatedType: 'Booking',
      relatedId: booking._id,
    })
  }

  return updated
}

/**
 * Assign an available worker of THIS garage and move ACCEPTED -> WORKER_ASSIGNED.
 */
async function assignWorker(bookingId, ownerId, workerId) {
  const booking = await getGarageBookingOrThrow(bookingId, ownerId)
  assertTransition(booking.status, 'WORKER_ASSIGNED')

  const worker = await workerRepository.findById(workerId)
  if (!worker || worker.garageId.toString() !== booking.garageId.toString()) {
    throw new ApiError(400, 'Worker must belong to this garage')
  }
  if (worker.status !== 'available') {
    throw new ApiError(400, 'Worker is not available')
  }

  await workerRepository.updateById(workerId, { status: 'busy' })
  const updated = await bookingRepository.updateById(
    bookingId,
    statusPatch('WORKER_ASSIGNED', { workerId })
  )
  await notificationService.notify(booking.customerId, {
    event: 'workerAssigned',
    title: 'Worker assigned',
    message: `A worker has been assigned to booking ${booking.bookingNumber}.`,
    relatedType: 'Booking',
    relatedId: booking._id,
  })
  return updated
}

/**
 * Start the job (PATCH /:id/start): requires the correct serviceOtp, then moves
 * WORKER_ASSIGNED -> IN_PROGRESS. Wrong/blank OTP is rejected.
 */
async function startService(bookingId, ownerId, otp, beforeImages = []) {
  const booking = await getGarageBookingOrThrow(bookingId, ownerId)
  assertTransition(booking.status, 'IN_PROGRESS')

  if (booking.bookingType === 'ONLINE' && (!otp || !booking.serviceOtp || otp !== booking.serviceOtp)) {
    throw new ApiError(400, 'Invalid service OTP')
  }

  const updated = await bookingRepository.updateById(bookingId, statusPatch('IN_PROGRESS', { beforeImages }))
  await notificationService.notify(booking.customerId, {
    event: 'bookingStarted',
    title: 'Service started',
    message: `Work has started on booking ${booking.bookingNumber}.`,
    relatedType: 'Booking',
    relatedId: booking._id,
  })
  return updated
}

/**
 * Complete the job (PATCH /:id/complete): IN_PROGRESS -> COMPLETED, optionally
 * attaching afterImages URLs (mock upload). Frees the assigned worker.
 */
async function completeService(bookingId, ownerId, afterImages = []) {
  const booking = await getGarageBookingOrThrow(bookingId, ownerId)
  assertTransition(booking.status, 'COMPLETED')

  if (booking.workerId) {
    await workerRepository.updateById(booking.workerId, { status: 'available' })
  }

  const updated = await bookingRepository.updateById(
    bookingId,
    statusPatch('COMPLETED', { afterImages })
  )
  await notificationService.notify(booking.customerId, {
    event: 'bookingCompleted',
    title: 'Service completed',
    message: `Booking ${booking.bookingNumber} is complete. You can now pay.`,
    relatedType: 'Booking',
    relatedId: booking._id,
  })
  return updated
}

export default {
  createBooking,
  createWalkInBooking,
  listBookings,
  listUpcoming,
  getBooking,
  cancelBooking,
  rescheduleBooking,
  // owner management
  listGarageBookings,
  listGarageWalkInBookings,
  getGarageBooking,
  updateBookingStatus,
  assignWorker,
  startService,
  completeService,
}
