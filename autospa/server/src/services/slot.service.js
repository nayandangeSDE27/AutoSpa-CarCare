import ApiError from '../utils/ApiError.js'
import garageRepository from '../repositories/garage.repository.js'
import serviceRepository from '../repositories/service.repository.js'
import bookingRepository from '../repositories/booking.repository.js'
import { parseHHMM, atMinutesUtc, weekdayUtc } from '../utils/time.js'

/**
 * Resolve the selected services for a garage and return them plus the total
 * booking length (sum of durations). Throws if any service is missing or
 * belongs to a different garage.
 */
export async function resolveServices(garageId, serviceIds) {
  const services = await serviceRepository.findByIds(serviceIds)
  if (services.length !== serviceIds.length) {
    throw new ApiError(400, 'One or more services were not found or are inactive')
  }
  const wrongGarage = services.some((s) => s.garageId.toString() !== garageId.toString())
  if (wrongGarage) {
    throw new ApiError(400, 'All services must belong to the selected garage')
  }
  const totalDuration = services.reduce((sum, s) => sum + s.durationMinutes, 0)
  return { services, totalDuration }
}

/**
 * Generate available start times for a garage on a date, given the selected
 * services. A start is available only if overlapping ACTIVE bookings for the
 * garage are fewer than its serviceBays.
 */
async function getAvailableSlots({ garageId, date, serviceIds }) {
  const garage = await garageRepository.findApprovedById(garageId)
  if (!garage) {
    throw new ApiError(404, 'Garage not found')
  }

  const { totalDuration } = await resolveServices(garageId, serviceIds)

  const base = {
    date,
    bookingLengthMinutes: totalDuration,
    slotDurationMinutes: garage.slotDurationMinutes,
    serviceBays: garage.serviceBays,
    slots: [],
  }

  const hours = garage.workingHours.find((w) => w.day === weekdayUtc(date))
  if (!hours || hours.isClosed) {
    return base // closed that day -> no slots
  }

  const openMin = parseHHMM(hours.open)
  const closeMin = parseHHMM(hours.close)
  const step = garage.slotDurationMinutes

  const slots = []
  for (let start = openMin; start + totalDuration <= closeMin; start += step) {
    const startTime = atMinutesUtc(date, start)
    const endTime = atMinutesUtc(date, start + totalDuration)
    // eslint-disable-next-line no-await-in-loop
    const overlapping = await bookingRepository.countOverlapping({
      garageId,
      startTime,
      endTime,
    })
    if (overlapping < garage.serviceBays) {
      slots.push({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        availableBays: garage.serviceBays - overlapping,
      })
    }
  }

  return { ...base, slots }
}

export default { getAvailableSlots, resolveServices }
