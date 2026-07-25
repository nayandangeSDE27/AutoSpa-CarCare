import bookingRepository from '../repositories/booking.repository.js'
import workerRepository from '../repositories/worker.repository.js'
import userRepository from '../repositories/user.repository.js'
import garageRepository from '../repositories/garage.repository.js'
import carRepository from '../repositories/car.repository.js'
import { ACTIVE_BOOKING_STATUSES } from '../models/booking.model.js'
import { getOwnerGarageOrThrow } from './garage.service.js'

/**
 * dashboardService — garage-owner dashboard cards.
 */

function todayRangeUtc() {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return { start, end }
}

async function getGarageDashboard(ownerId) {
  const garage = await getOwnerGarageOrThrow(ownerId)
  const { start, end } = todayRangeUtc()
  const todayFilter = { bookingDate: { $gte: start, $lt: end } }

  const [todayRevenue, todayBookings, pendingRequests, availableWorkers] = await Promise.all([
    bookingRepository.sumAmount(garage._id, { ...todayFilter, status: 'COMPLETED' }),
    bookingRepository.countByGarage(garage._id, todayFilter),
    bookingRepository.countByGarage(garage._id, { status: 'PENDING' }),
    workerRepository.countAvailable(garage._id),
  ])

  return {
    garageId: garage._id,
    todayRevenue,
    todayBookings,
    pendingRequests,
    availableWorkers,
  }
}

// ----- Customer dashboard -----
async function getCustomerDashboard(customerId) {
  const [allBookings, cars] = await Promise.all([
    bookingRepository.findByCustomer(customerId),
    carRepository.findByOwner(customerId),
  ])

  const now = new Date()
  const upcoming = allBookings
    .filter((b) => ACTIVE_BOOKING_STATUSES.includes(b.status) && b.startTime >= now)
    .sort((a, b) => a.startTime - b.startTime)
  const completed = allBookings.filter((b) => b.status === 'COMPLETED')

  const nextBooking = upcoming[0] || null
  const recentBookings = [...allBookings]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5)

  return {
    stats: {
      totalBookings: allBookings.length,
      upcoming: upcoming.length,
      completed: completed.length,
      cars: cars.length,
    },
    nextBooking,
    recentBookings,
  }
}

// ----- Admin dashboard cards -----
async function getAdminDashboard() {
  const [totalUsers, totalGarages, activeBookings, pendingVerifications] = await Promise.all([
    userRepository.count(),
    garageRepository.count(),
    bookingRepository.count({ status: { $in: ACTIVE_BOOKING_STATUSES } }),
    garageRepository.count({ verificationStatus: 'PENDING' }),
  ])
  return { totalUsers, totalGarages, activeBookings, pendingVerifications }
}

export default { getGarageDashboard, getAdminDashboard, getCustomerDashboard }
