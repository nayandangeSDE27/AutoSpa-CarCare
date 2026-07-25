import ApiError from '../utils/ApiError.js'
import reviewRepository from '../repositories/review.repository.js'
import bookingRepository from '../repositories/booking.repository.js'
import garageRepository from '../repositories/garage.repository.js'
import userRepository from '../repositories/user.repository.js'

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000

async function recomputeGarageRating(garageId) {
  const { avg } = await reviewRepository.avgForGarage(garageId)
  await garageRepository.updateById(garageId, { rating: Math.round(avg * 10) / 10 })
}

function listMine(customerId) {
  return reviewRepository.findByCustomer(customerId)
}

/**
 * Completed bookings by this customer that don't yet have a review.
 */
async function listPending(customerId) {
  const [bookings, reviewedIds] = await Promise.all([
    bookingRepository.findByCustomer(customerId, { status: 'COMPLETED' }),
    reviewRepository.reviewedBookingIds(customerId),
  ])
  const reviewed = new Set(reviewedIds)
  return bookings.filter((b) => !reviewed.has(String(b._id)))
}

async function createReview(customerId, { bookingId, rating, comment }) {
  const booking = await bookingRepository.findById(bookingId)
  if (!booking || booking.customerId.toString() !== customerId.toString()) {
    throw new ApiError(404, 'Booking not found')
  }
  if (booking.status !== 'COMPLETED') {
    throw new ApiError(400, 'You can only review completed bookings')
  }
  const existing = await reviewRepository.findByBooking(bookingId)
  if (existing) throw new ApiError(409, 'You have already reviewed this booking')

  const user = await userRepository.findById(customerId)
  const review = await reviewRepository.create({
    customerId,
    garageId: booking.garageId,
    bookingId,
    customerName: user?.name || '',
    rating,
    comment: comment || '',
  })
  await recomputeGarageRating(booking.garageId)
  return review
}

async function updateReview(id, customerId, { rating, comment }) {
  const review = await reviewRepository.findById(id)
  if (!review || review.customerId.toString() !== customerId.toString()) {
    throw new ApiError(404, 'Review not found')
  }
  if (Date.now() - new Date(review.createdAt).getTime() > EDIT_WINDOW_MS) {
    throw new ApiError(400, 'Reviews can only be edited within 24 hours')
  }
  const patch = {}
  if (rating !== undefined) patch.rating = rating
  if (comment !== undefined) patch.comment = comment
  const updated = await reviewRepository.updateById(id, patch)
  await recomputeGarageRating(review.garageId)
  return updated
}

async function deleteReview(id, customerId) {
  const review = await reviewRepository.findById(id)
  if (!review || review.customerId.toString() !== customerId.toString()) {
    throw new ApiError(404, 'Review not found')
  }
  await reviewRepository.deleteById(id)
  await recomputeGarageRating(review.garageId)
}

function getTestimonials() {
  return reviewRepository.findTestimonials({ minRating: 4, limit: 6 })
}

function listByGarage(garageId) {
  return reviewRepository.findByGarage(garageId)
}

/**
 * Garage owner replies publicly to a review of their own garage.
 */
async function replyToReview(reviewId, ownerId, text) {
  const review = await reviewRepository.findById(reviewId)
  if (!review) throw new ApiError(404, 'Review not found')
  const garage = await garageRepository.findById(review.garageId)
  if (!garage || garage.owner?.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'You can only reply to reviews of your own garage')
  }
  return reviewRepository.updateById(reviewId, { reply: text, repliedAt: new Date() })
}

export default { listMine, listPending, createReview, updateReview, deleteReview, getTestimonials, listByGarage, replyToReview }
