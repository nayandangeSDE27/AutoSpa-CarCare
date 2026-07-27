import mongoose from 'mongoose'

import Review from '../models/review.model.js'

/**
 * reviewRepository — the ONLY module that touches the Review model.
 */

function create(data) {
  return Review.create(data)
}

function findById(id) {
  return Review.findById(id)
}

function findByCustomer(customerId) {
  return Review.find({ customerId }).sort({ createdAt: -1 })
}

function findByBooking(bookingId) {
  return Review.findOne({ bookingId })
}

function findByGarage(garageId, limit = 50) {
  return Review.find({ garageId }).sort({ createdAt: -1 }).limit(limit)
}

async function reviewedBookingIds(customerId) {
  const rows = await Review.find({ customerId }).select('bookingId').lean()
  return rows.map((r) => String(r.bookingId)).filter(Boolean)
}

function updateById(id, patch) {
  return Review.findByIdAndUpdate(id, patch, { returnDocument: 'after', runValidators: true })
}

function deleteById(id) {
  return Review.findByIdAndDelete(id)
}

// Recent high-rating reviews for landing-page testimonials.
function findTestimonials({ minRating = 4, limit = 6 } = {}) {
  return Review.find({ rating: { $gte: minRating } }).sort({ createdAt: -1 }).limit(limit)
}

function count() {
  return Review.countDocuments({})
}

async function avgForGarage(garageId) {
  const [row] = await Review.aggregate([
    { $match: { garageId: new mongoose.Types.ObjectId(garageId) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  return { avg: row?.avg || 0, count: row?.count || 0 }
}

export default {
  create,
  findById,
  findByCustomer,
  findByBooking,
  findByGarage,
  reviewedBookingIds,
  updateById,
  deleteById,
  findTestimonials,
  count,
  avgForGarage,
}
