import ApiError from '../utils/ApiError.js'
import garageRepository from '../repositories/garage.repository.js'
import garageDocumentRepository from '../repositories/garageDocument.repository.js'
import notificationService from './notification.service.js'
import cloudinary from '../utils/cloudinary.js'

/**
 * garageService — customer-facing discovery logic (approved garages only) plus
 * garage-owner profile management. Ownership is enforced here: an owner may only
 * ever touch their own garage.
 */

function listGarages() {
  return garageRepository.findApproved()
}

function listFeatured() {
  return garageRepository.findFeatured()
}

async function getGarage(id) {
  const garage = await garageRepository.findApprovedById(id)
  if (!garage) {
    throw new ApiError(404, 'Garage not found')
  }
  return garage
}

/**
 * Nearest approved garages within `radius` metres of the given coordinates.
 */
function findNearby({ lng, lat, radius }) {
  return garageRepository.findNearby({
    lng,
    lat,
    radiusMeters: radius,
  })
}

// ----- Garage-owner profile management -----

/**
 * Load the owner's garage, or throw. Used as the ownership gate for owner-only
 * garage operations elsewhere in the codebase.
 */
export async function getOwnerGarage(ownerId) {
  return garageRepository.findByOwner(ownerId)
}

export async function getOwnerGarageOrThrow(ownerId) {
  const garage = await getOwnerGarage(ownerId)
  if (!garage) {
    throw new ApiError(404, 'You do not have a garage yet')
  }
  return garage
}

async function createOwnGarage(ownerId, data) {
  const existing = await garageRepository.findByOwner(ownerId)
  if (existing) {
    throw new ApiError(409, 'You already have a garage')
  }
  const garage = await garageRepository.create({
    ...data,
    owner: ownerId,
    location: { type: 'Point', coordinates: [data.location.lng, data.location.lat] },
    verificationStatus: 'PENDING', // awaits admin approval (Phase 5)
  })

  // Notify admins that a new garage was registered and needs verification.
  await notificationService.notifyAdmins({
    event: 'garageRegistered',
    title: 'New garage registered',
    message: `Garage "${garage.name}" registered and is awaiting verification.`,
    relatedType: 'Garage',
    relatedId: garage._id,
  })

  return garage
}

async function assertOwnsGarage(garageId, ownerId) {
  const garage = await garageRepository.findById(garageId)
  if (!garage || garage.owner?.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'You can only manage your own garage')
  }
  return garage
}

async function updateOwnGarage(garageId, ownerId, update) {
  await assertOwnsGarage(garageId, ownerId)
  const patch = { ...update }
  if (update.location) {
    patch.location = { type: 'Point', coordinates: [update.location.lng, update.location.lat] }
  }
  return garageRepository.updateById(garageId, patch)
}

async function addGalleryImages(ownerId, urls) {
  // Add already-hosted image URLs directly to the gallery.
  const garage = await getOwnerGarageOrThrow(ownerId)
  return garageRepository.pushGallery(garage._id, urls)
}

/**
 * Upload image files (Multer buffers) to Cloudinary — or the mock fallback when
 * Cloudinary isn't configured — and append the resulting URLs to the gallery.
 */
async function uploadGalleryImages(ownerId, files) {
  const garage = await getOwnerGarageOrThrow(ownerId)
  if (!files?.length) throw new ApiError(400, 'No image files provided')
  const results = await Promise.all(
    files.map((f, i) =>
      cloudinary.uploadImage(f.buffer, { folder: `garages/${garage._id}/gallery`, filename: `img-${i}` })
    )
  )
  return garageRepository.pushGallery(garage._id, results.map((r) => r.url))
}

async function submitDocuments(ownerId, documents) {
  const garage = await getOwnerGarageOrThrow(ownerId)
  return garageDocumentRepository.create({
    garageId: garage._id,
    documents,
    status: 'PENDING',
  })
}

export default {
  listGarages,
  listFeatured,
  getGarage,
  findNearby,
  getOwnerGarage,
  getOwnerGarageOrThrow,
  createOwnGarage,
  assertOwnsGarage,
  updateOwnGarage,
  addGalleryImages,
  uploadGalleryImages,
  submitDocuments,
}
