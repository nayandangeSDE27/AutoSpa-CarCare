import GarageDocument from '../models/garageDocument.model.js'

/**
 * garageDocumentRepository — the ONLY module that touches the GarageDocument model.
 */

function create(data) {
  return GarageDocument.create(data)
}

function findByGarage(garageId) {
  return GarageDocument.find({ garageId }).sort({ createdAt: -1 })
}

export default {
  create,
  findByGarage,
}
