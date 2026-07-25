import ApiError from '../utils/ApiError.js'
import workerRepository from '../repositories/worker.repository.js'
import bookingRepository from '../repositories/booking.repository.js'
import { getOwnerGarageOrThrow } from './garage.service.js'

/**
 * workerService — garage-owner worker management. Owners may only manage workers
 * of their own garage. `todayJobs` is derived from bookings, never stored.
 */

function todayRangeUtc() {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
  return { start, end }
}

async function assertOwnsWorker(workerId, ownerId) {
  const worker = await workerRepository.findById(workerId)
  if (!worker) {
    throw new ApiError(404, 'Worker not found')
  }
  const garage = await getOwnerGarageOrThrow(ownerId)
  if (worker.garageId.toString() !== garage._id.toString()) {
    throw new ApiError(403, 'You can only manage your own garage\'s workers')
  }
  return worker
}

async function createWorker(ownerId, data) {
  const garage = await getOwnerGarageOrThrow(ownerId)
  return workerRepository.create({ ...data, garageId: garage._id })
}

async function listWorkers(ownerId) {
  const garage = await getOwnerGarageOrThrow(ownerId)
  const workers = await workerRepository.findByGarage(garage._id)
  const { start, end } = todayRangeUtc()

  // Attach derived todayJobs to each worker.
  return Promise.all(
    workers.map(async (w) => {
      const todayJobs = await bookingRepository.countTodayJobsForWorker(w._id, start, end)
      return { ...w.toJSON(), todayJobs }
    })
  )
}

async function updateWorker(workerId, ownerId, update) {
  await assertOwnsWorker(workerId, ownerId)
  return workerRepository.updateById(workerId, update)
}

async function deleteWorker(workerId, ownerId) {
  await assertOwnsWorker(workerId, ownerId)
  await workerRepository.deleteById(workerId)
}

async function setStatus(workerId, ownerId, status) {
  await assertOwnsWorker(workerId, ownerId)
  return workerRepository.updateById(workerId, { status })
}

export default {
  createWorker,
  listWorkers,
  updateWorker,
  deleteWorker,
  setStatus,
}
