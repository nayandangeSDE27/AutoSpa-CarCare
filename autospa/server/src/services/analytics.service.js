import analyticsRepository from '../repositories/analytics.repository.js'
import { getOwnerGarageOrThrow } from './garage.service.js'

/**
 * analyticsService — garage-owner and admin analytics via aggregation pipelines.
 */

async function getGarageAnalytics(ownerId) {
  const garage = await getOwnerGarageOrThrow(ownerId)
  const [revenueOverTime, bookingsByStatus, topServices, bookingsByType] = await Promise.all([
    analyticsRepository.garageRevenueOverTime(garage._id),
    analyticsRepository.garageBookingsByStatus(garage._id),
    analyticsRepository.garageTopServices(garage._id),
    analyticsRepository.garageBookingsByType(garage._id),
  ])
  return { garageId: garage._id, revenueOverTime, bookingsByStatus, topServices, bookingsByType }
}

async function getAdminAnalytics() {
  const [revenueOverTime, garagesByStatus, bookingsTrend] = await Promise.all([
    analyticsRepository.platformRevenueOverTime(),
    analyticsRepository.garagesByStatus(),
    analyticsRepository.bookingsTrend(),
  ])
  return { revenueOverTime, garagesByStatus, bookingsTrend }
}

export default { getGarageAnalytics, getAdminAnalytics }
