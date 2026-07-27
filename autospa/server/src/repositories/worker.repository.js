import Worker from '../models/worker.model.js'

/**
 * workerRepository — the ONLY module that touches the Worker model.
 */

function create(data) {
  return Worker.create(data)
}

function findById(id) {
  return Worker.findById(id)
}

function findByGarage(garageId) {
  return Worker.find({ garageId }).sort({ createdAt: -1 })
}

function countAvailable(garageId) {
  return Worker.countDocuments({ garageId, status: 'available' })
}

function updateById(id, update) {
  return Worker.findByIdAndUpdate(id, update, { returnDocument: 'after', runValidators: true })
}

function deleteById(id) {
  return Worker.findByIdAndDelete(id)
}

export default {
  create,
  findById,
  findByGarage,
  countAvailable,
  updateById,
  deleteById,
}
