import mongoose from 'mongoose'

const { Schema, model } = mongoose

export const BOOKING_STATUS = [
  'PENDING',
  'ACCEPTED',
  'WORKER_ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'REJECTED',
  'NO_SHOW',
]

// Statuses that occupy a service bay for overlap/concurrency counting.
export const ACTIVE_BOOKING_STATUSES = [
  'PENDING',
  'ACCEPTED',
  'WORKER_ASSIGNED',
  'IN_PROGRESS',
]

// A service snapshot — price/duration/name captured at booking time so later
// edits to the Service catalogue don't change historical bookings.
const bookedServiceSchema = new Schema(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    nameAtBooking: { type: String, required: true },
    priceAtBooking: { type: Number, required: true, min: 0 },
    durationAtBooking: { type: Number, required: true, min: 1 },
  },
  { _id: false }
)

// Bookings (CLAUDE.md sections 7 & 8).
const bookingSchema = new Schema(
  {
    bookingNumber: { type: String, required: true, unique: true },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    carId: { type: Schema.Types.ObjectId, ref: 'Car', default: null },
    garageId: {
      type: Schema.Types.ObjectId,
      ref: 'Garage',
      required: true,
      index: true,
    },

    services: {
      type: [bookedServiceSchema],
      validate: [(v) => v.length > 0, 'At least one service is required'],
    },

    bookingDate: { type: Date, required: true }, // UTC midnight of the day
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true }, // start + summed durations

    status: { type: String, enum: BOOKING_STATUS, default: 'PENDING', index: true },
    bookingType: {
      type: String,
      enum: ['ONLINE', 'WALK_IN'],
      default: 'ONLINE',
      index: true,
    },
    serviceOtp: { type: String, default: '' }, // empty until the garage accepts

    customerName: { type: String, trim: true, default: '' },
    customerPhone: { type: String, trim: true, default: '' },
    vehicleRegistrationNumber: { type: String, trim: true, default: '' },
    vehicleBrand: { type: String, trim: true, default: '' },
    vehicleModel: { type: String, trim: true, default: '' },
    vehicleType: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },

    subtotalAmount: { type: Number, required: true, min: 0 },
    taxAmount: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'REFUNDED', 'FAILED'],
      default: 'PENDING',
    },
    workerId: { type: Schema.Types.ObjectId, ref: 'Worker', default: null },
    beforeImages: { type: [String], default: [] }, // attached when starting the job
    afterImages: { type: [String], default: [] }, // attached on completion

    // Derived flag (true while status is active) so the partial unique index
    // below only applies to live bookings.
    isActive: { type: Boolean, default: true },

    // Cron bookkeeping so reminders / follow-ups fire at most once.
    reminderSent: { type: Boolean, default: false },
    followUpSent: { type: Boolean, default: false },
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

// Keep isActive in sync with status on document saves.
bookingSchema.pre('validate', function syncIsActive() {
  this.isActive = ACTIVE_BOOKING_STATUSES.includes(this.status)
})

// Fast overlap lookups for the garage on a given day.
bookingSchema.index({ garageId: 1, startTime: 1, endTime: 1 })

// Backstop partial unique index (CLAUDE.md section 7): a given car cannot hold
// two ACTIVE bookings that start at the same instant, even if the concurrency
// transaction were somehow bypassed. Partial filter uses isActive (equality)
// because $in isn't allowed in partialFilterExpression.
bookingSchema.index(
  { carId: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
)

const Booking = model('Booking', bookingSchema)

export default Booking
