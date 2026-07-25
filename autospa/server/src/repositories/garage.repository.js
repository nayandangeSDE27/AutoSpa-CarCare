import Garage from '../models/garage.model.js'

/**
 * garageRepository — the ONLY module that touches the Garage model.
 */

function create(data) {
  return Garage.create(data)
}

function findApproved(filter = {}) {
  return Garage.find({ verificationStatus: 'APPROVED', ...filter }).sort({ createdAt: -1 })
}

function findFeatured(limit = 10) {
  return Garage.find({ verificationStatus: 'APPROVED', isFeatured: true })
    .sort({ rating: -1 })
    .limit(limit)
}

function findApprovedById(id) {
  return Garage.findOne({ _id: id, verificationStatus: 'APPROVED' })
}

function findById(id) {
  return Garage.findById(id)
}

/**
 * Approved garages within `radiusMeters` of [lng, lat], nearest first.
 * $near on a 2dsphere index returns results sorted by distance automatically.
 */
function findNearby({ lng, lat, radiusMeters, limit = 50 }) {
  return Garage.find({
    verificationStatus: 'APPROVED',
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radiusMeters,
      },
    },
  }).limit(limit)
}

function findByOwner(ownerId) {
  return Garage.findOne({ owner: ownerId })
}

// ----- Admin: sees every garage regardless of status -----
function findAll(filter = {}) {
  return Garage.find(filter).sort({ createdAt: -1 })
}

function count(filter = {}) {
  return Garage.countDocuments(filter)
}

async function countByVerificationStatus() {
  const rows = await Garage.aggregate([
    { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
  ])
  return Object.fromEntries(rows.map((r) => [r._id, r.count]))
}

function updateById(id, update) {
  return Garage.findByIdAndUpdate(id, update, { new: true, runValidators: true })
}

function pushGallery(id, urls) {
  return Garage.findByIdAndUpdate(
    id,
    { $push: { images: { $each: urls } } },
    { new: true }
  )
}

export default {
  create,
  findApproved,
  findFeatured,
  findApprovedById,
  findById,
  findByOwner,
  findAll,
  count,
  countByVerificationStatus,
  findNearby,
  updateById,
  pushGallery,
}
