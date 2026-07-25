import ApiError from '../utils/ApiError.js'
import carRepository from '../repositories/car.repository.js'

/**
 * carService — all car logic. Ownership is enforced here: a customer may only
 * read/modify/delete their own cars.
 */

async function getOwnedCarOrThrow(carId, ownerId) {
  const car = await carRepository.findById(carId)
  // Return 404 (not 403) for someone else's car so we don't leak existence.
  if (!car || car.owner.toString() !== ownerId.toString()) {
    throw new ApiError(404, 'Car not found')
  }
  return car
}

function createCar(ownerId, data) {
  return carRepository.create({ ...data, owner: ownerId })
}

function listCars(ownerId) {
  return carRepository.findByOwner(ownerId)
}

function getCar(carId, ownerId) {
  return getOwnedCarOrThrow(carId, ownerId)
}

async function updateCar(carId, ownerId, update) {
  await getOwnedCarOrThrow(carId, ownerId)
  return carRepository.updateById(carId, update)
}

async function deleteCar(carId, ownerId) {
  await getOwnedCarOrThrow(carId, ownerId)
  await carRepository.deleteById(carId)
}

export default {
  createCar,
  listCars,
  getCar,
  updateCar,
  deleteCar,
}
