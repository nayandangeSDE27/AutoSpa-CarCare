import ApiError from '../utils/ApiError.js'
import logger from '../utils/logger.js'
import garageRepository from '../repositories/garage.repository.js'
import userRepository from '../repositories/user.repository.js'
import bookingRepository from '../repositories/booking.repository.js'
import paymentRepository from '../repositories/payment.repository.js'
import settingsService from './settings.service.js'

/**
 * adminService — platform administration. Every method here runs only for admins
 * (enforced by the route middleware); admins see all data regardless of owner.
 */

// ---------------- GARAGE VERIFICATION ----------------

async function listGarages({ status } = {}) {
  const filter = status ? { verificationStatus: status } : {}
  const [garages, bookingCounts, commission] = await Promise.all([
    garageRepository.findAll(filter).populate('owner', 'name email'),
    bookingRepository.countGroupedByGarage(),
    paymentRepository.commissionByGarage(),
  ])
  const bookingMap = new Map(bookingCounts.map((r) => [String(r._id), r.count]))
  const commMap = new Map(commission.map((r) => [String(r._id), r.commission]))
  return garages.map((g) => ({
    ...g.toObject(),
    totalBookings: bookingMap.get(String(g._id)) || 0,
    commissionEarned: Math.round((commMap.get(String(g._id)) || 0) * 100) / 100,
  }))
}

async function getGarageOrThrow(id) {
  const garage = await garageRepository.findById(id)
  if (!garage) throw new ApiError(404, 'Garage not found')
  return garage
}

async function approveGarage(id) {
  const garage = await getGarageOrThrow(id)
  const updated = await garageRepository.updateById(id, {
    verificationStatus: 'APPROVED',
    rejectionReason: '',
  })
  // Notify the owner (console for now).
  logger.info(`[notify] Garage "${garage.name}" (owner ${garage.owner}) has been APPROVED`)
  return updated
}

async function rejectGarage(id, reason) {
  const garage = await getGarageOrThrow(id)
  const updated = await garageRepository.updateById(id, {
    verificationStatus: 'REJECTED',
    rejectionReason: reason || '',
  })
  logger.info(`[notify] Garage "${garage.name}" (owner ${garage.owner}) was REJECTED: ${reason || ''}`)
  return updated
}

async function suspendGarage(id) {
  const garage = await getGarageOrThrow(id)
  if (garage.verificationStatus !== 'APPROVED') {
    throw new ApiError(400, 'Only an approved garage can be suspended')
  }
  const updated = await garageRepository.updateById(id, { verificationStatus: 'SUSPENDED' })
  logger.info(`[notify] Garage "${garage.name}" (owner ${garage.owner}) has been SUSPENDED`)
  return updated
}

// ---------------- USER MANAGEMENT ----------------

async function listUsers({ role, status, page, limit } = {}) {
  const filter = {}
  if (role) filter.role = role
  if (status) filter.status = status
  const [result, counts] = await Promise.all([
    userRepository.findPaginated(filter, { page, limit }),
    bookingRepository.countGroupedByCustomer(),
  ])
  const map = new Map(counts.map((r) => [String(r._id), r.count]))
  result.items = result.items.map((u) => ({ ...u.toObject(), bookingCount: map.get(String(u._id)) || 0 }))
  return result
}

async function setUserStatus(id, status) {
  const user = await userRepository.findById(id)
  if (!user) throw new ApiError(404, 'User not found')
  return userRepository.updateById(id, { status })
}

const blockUser = (id) => setUserStatus(id, 'blocked')
const unblockUser = (id) => setUserStatus(id, 'active')

// ---------------- BOOKING MONITORING (read-only) ----------------

function listBookings({ status, garageId, customerId, from, to, page, limit } = {}) {
  const filter = {}
  if (status) filter.status = status
  if (garageId) filter.garageId = garageId
  if (customerId) filter.customerId = customerId
  if (from || to) {
    filter.bookingDate = {}
    if (from) filter.bookingDate.$gte = new Date(from)
    if (to) filter.bookingDate.$lte = new Date(to)
  }
  return bookingRepository.findPaginatedPopulated(filter, { page, limit })
}

// ---------------- REPORTS ----------------

async function getReports() {
  const settings = await settingsService.getSettings()
  const [usersByRole, totalUsers, garagesByStatus, totalGarages, bookingsByStatus, totalBookings, revenue] =
    await Promise.all([
      userRepository.countByRole(),
      userRepository.count(),
      garageRepository.countByVerificationStatus(),
      garageRepository.count(),
      bookingRepository.countByStatus(),
      bookingRepository.count(),
      // Revenue from COMPLETED + PAID bookings.
      bookingRepository.sumAmount(undefined, { status: 'COMPLETED', paymentStatus: 'PAID' }),
    ])

  const commission = Math.round(revenue * settings.commissionRate * 100) / 100

  return {
    users: { total: totalUsers, byRole: usersByRole },
    garages: { total: totalGarages, byVerificationStatus: garagesByStatus },
    bookings: { total: totalBookings, byStatus: bookingsByStatus },
    revenue: { totalRevenue: revenue, commissionRate: settings.commissionRate, totalCommission: commission },
  }
}

export default {
  listGarages,
  approveGarage,
  rejectGarage,
  suspendGarage,
  listUsers,
  blockUser,
  unblockUser,
  listBookings,
  getReports,
}
