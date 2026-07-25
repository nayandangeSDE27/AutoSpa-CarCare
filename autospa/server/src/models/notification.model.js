import mongoose from 'mongoose'

const { Schema, model } = mongoose

// Notification (CLAUDE.md section 7).
const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, default: 'info' }, // e.g. 'bookingAccepted', 'paymentReceived'
    title: { type: String, required: true },
    message: { type: String, default: '' },
    relatedType: { type: String, default: '' }, // e.g. 'Booking', 'Payment', 'Garage'
    relatedId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false, index: true },
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

const Notification = model('Notification', notificationSchema)

export default Notification
