import Service from '../models/service.model.js'

/**
 * serviceRepository — the ONLY module that touches the Service model.
 */

function create(data) {
  return Service.create(data)
}

function findByGarage(garageId) {
  return Service.find({ garageId, isActive: true }).sort({ name: 1 })
}

// Owner view: all services (including inactive).
function findAllByGarage(garageId) {
  return Service.find({ garageId }).sort({ name: 1 })
}

function findPopular(limit = 10) {
  return Service.find({ isActive: true })
    .sort({ isPopular: -1, bookingsCount: -1 })
    .limit(limit)
}

function findByIds(ids) {
  return Service.find({ _id: { $in: ids }, isActive: true })
}

function findById(id) {
  return Service.findById(id)
}

function updateById(id, update) {
  return Service.findByIdAndUpdate(id, update, { new: true, runValidators: true })
}

function deleteById(id) {
  return Service.findByIdAndDelete(id)
}

export default {
  create,
  findByGarage,
  findAllByGarage,
  findPopular,
  findByIds,
  findById,
  updateById,
  deleteById,
}
