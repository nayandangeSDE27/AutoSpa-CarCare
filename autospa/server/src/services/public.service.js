import garageRepository from '../repositories/garage.repository.js'
import userRepository from '../repositories/user.repository.js'
import bookingRepository from '../repositories/booking.repository.js'
import reviewRepository from '../repositories/review.repository.js'

/**
 * publicService — unauthenticated landing-page data. Only aggregate/headline
 * numbers and a few testimonials; no per-user data.
 */

async function getPublicStats() {
  const [approvedGarages, completedBookings, totalCustomers] = await Promise.all([
    garageRepository.count({ verificationStatus: 'APPROVED' }),
    bookingRepository.count({ status: 'COMPLETED' }),
    userRepository.count({ role: 'customer' }),
  ])
  return { approvedGarages, completedBookings, totalCustomers }
}

function getTestimonials() {
  return reviewRepository.findTestimonials({ minRating: 4, limit: 6 })
}

export default { getPublicStats, getTestimonials }
