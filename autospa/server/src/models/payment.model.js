import mongoose from 'mongoose'

const { Schema, model } = mongoose

export const PAYMENT_STATUS = ['PENDING', 'PAID', 'FAILED', 'REFUNDED']

// Payment (CLAUDE.md section 7) — one per booking payment attempt.
const paymentSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    garageId: { type: Schema.Types.ObjectId, ref: 'Garage', required: true, index: true },
    amount: { type: Number, required: true, min: 0 }, // major units (e.g. dollars)
    currency: { type: String, default: 'usd' },
    paymentMethod: { type: String, enum: ['upi', 'card', 'cash'], default: 'card', index: true },
    stripePaymentIntentId: { type: String, index: true },
    clientSecret: { type: String, select: false },
    status: { type: String, enum: PAYMENT_STATUS, default: 'PENDING', index: true },
    commission: { type: Number, default: 0 },
    garageEarnings: { type: Number, default: 0 },
    // Idempotency: the Stripe event id that flipped this to PAID.
    processedEventId: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v
        delete ret.clientSecret
        return ret
      },
    },
  }
)

const Payment = model('Payment', paymentSchema)

export default Payment
