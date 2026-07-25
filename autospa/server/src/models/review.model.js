import mongoose from 'mongoose'

const { Schema, model } = mongoose

// Reviews (CLAUDE.md section 7) — a customer's rating of a completed booking.
const reviewSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    garageId: { type: Schema.Types.ObjectId, ref: 'Garage', required: true, index: true },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    customerName: { type: String, default: '' }, // denormalised for testimonials
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    // Public owner reply.
    reply: { type: String, default: '' },
    repliedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v
        return ret
      },
    },
  }
)

const Review = model('Review', reviewSchema)

export default Review
