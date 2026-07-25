import ApiError from '../utils/ApiError.js'
import bookingRepository from '../repositories/booking.repository.js'
import userRepository from '../repositories/user.repository.js'
import garageRepository from '../repositories/garage.repository.js'
import paymentRepository from '../repositories/payment.repository.js'

/**
 * invoiceService — authorizes access and gathers the data for a booking's
 * invoice. PDF rendering itself lives in utils/invoicePdf.js.
 */
async function getInvoiceData(bookingId, user) {
  const booking = await bookingRepository.findById(bookingId)
  if (!booking) throw new ApiError(404, 'Booking not found')

  const garage = await garageRepository.findById(booking.garageId)

  // Access: the booking's customer, or the garage's owner.
  const isCustomer = booking.customerId.toString() === user.id.toString()
  const isOwner = garage?.owner?.toString() === user.id.toString()
  if (!isCustomer && !isOwner) throw new ApiError(404, 'Booking not found')

  if (booking.paymentStatus !== 'PAID') {
    throw new ApiError(400, 'Invoice is only available for paid bookings')
  }

  const [customer, payment] = await Promise.all([
    userRepository.findById(booking.customerId),
    paymentRepository.findByBooking(booking._id),
  ])

  return { booking, garage, customer, payment }
}

export default { getInvoiceData }
