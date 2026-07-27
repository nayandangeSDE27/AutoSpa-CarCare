import Payment from '../models/payment.model.js'

/**
 * paymentRepository — the ONLY module that touches the Payment model.
 */

function create(data) {
  return Payment.create(data)
}

function findById(id) {
  return Payment.findById(id)
}

function findByPaymentIntentId(pi, session = null) {
  return Payment.findOne({ stripePaymentIntentId: pi }).session(session)
}

function findByBooking(bookingId) {
  return Payment.findOne({ bookingId }).sort({ createdAt: -1 })
}

function updateById(id, update, session = null) {
  return Payment.findByIdAndUpdate(id, update, { returnDocument: 'after', session })
}

async function findPaginated(filter = {}, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Payment.countDocuments(filter),
  ])
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 0 }
}

// Admin: total commission per garage from PAID payments.
function commissionByGarage() {
  return Payment.aggregate([
    { $match: { status: 'PAID' } },
    { $group: { _id: '$garageId', commission: { $sum: '$commission' }, gross: { $sum: '$amount' } } },
  ])
}

export default {
  create,
  findById,
  findByPaymentIntentId,
  findByBooking,
  updateById,
  findPaginated,
  commissionByGarage,
}
