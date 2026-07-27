import Car from '../models/car.model.js'

/**
 * carRepository — the ONLY module that touches the Car model.
 */

function create(data, session = null) {
  return Car.create([data], { session }).then((docs) => docs[0])
}

function findById(id) {
  return Car.findById(id)
}

function findByOwner(ownerId) {
  return Car.find({ owner: ownerId }).sort({ createdAt: -1 })
}

function updateById(id, update) {
  return Car.findByIdAndUpdate(id, update, { returnDocument: 'after', runValidators: true })
}

function deleteById(id) {
  return Car.findByIdAndDelete(id)
}

export default {
  create,
  findById,
  findByOwner,
  updateById,
  deleteById,
}
