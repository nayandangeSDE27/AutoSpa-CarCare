import ApiError from '../utils/ApiError.js'
import serviceRepository from '../repositories/service.repository.js'
import { getOwnerGarageOrThrow } from './garage.service.js'

/**
 * serviceService — customer listing plus garage-owner catalogue management.
 * Owners may only manage services belonging to their own garage.
 */

function listByGarage(garageId) {
  return serviceRepository.findByGarage(garageId)
}

function listPopular() {
  return serviceRepository.findPopular()
}

// ----- Owner catalogue management -----

async function listOwn(ownerId) {
  const garage = await getOwnerGarageOrThrow(ownerId)
  return serviceRepository.findAllByGarage(garage._id)
}

async function createOwnService(ownerId, data) {
  const garage = await getOwnerGarageOrThrow(ownerId)
  return serviceRepository.create({ ...data, garageId: garage._id })
}

async function assertOwnsService(serviceId, ownerId) {
  const service = await serviceRepository.findById(serviceId)
  if (!service) {
    throw new ApiError(404, 'Service not found')
  }
  const garage = await getOwnerGarageOrThrow(ownerId)
  if (service.garageId.toString() !== garage._id.toString()) {
    throw new ApiError(403, 'You can only manage your own garage\'s services')
  }
  return service
}

async function updateOwnService(serviceId, ownerId, update) {
  await assertOwnsService(serviceId, ownerId)
  return serviceRepository.updateById(serviceId, update)
}

async function deleteOwnService(serviceId, ownerId) {
  await assertOwnsService(serviceId, ownerId)
  await serviceRepository.deleteById(serviceId)
}

export default {
  listByGarage,
  listPopular,
  listOwn,
  createOwnService,
  updateOwnService,
  deleteOwnService,
}
