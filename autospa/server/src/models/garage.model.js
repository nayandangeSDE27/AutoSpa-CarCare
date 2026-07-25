import mongoose from 'mongoose'

const { Schema, model } = mongoose

export const GARAGE_VERIFICATION_STATUS = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']

// A single weekday's opening hours. day: 0 = Sunday … 6 = Saturday.
const workingHoursSchema = new Schema(
  {
    day: { type: Number, required: true, min: 0, max: 6 },
    open: { type: String, default: '09:00' }, // "HH:mm" (24h)
    close: { type: String, default: '18:00' }, // "HH:mm" (24h)
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
)

// Garages (CLAUDE.md section 7).
const garageSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    description: { type: String, default: '' },
    address: { type: String, default: '' },

    // GeoJSON Point: coordinates are [longitude, latitude].
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    serviceBays: { type: Number, required: true, min: 1, default: 1 },
    workingHours: { type: [workingHoursSchema], default: [] },
    slotDurationMinutes: { type: Number, default: 30, min: 5 },
    autoAcceptBookings: { type: Boolean, default: false },

    verificationStatus: {
      type: String,
      enum: GARAGE_VERIFICATION_STATUS,
      default: 'PENDING',
      index: true,
    },
    rejectionReason: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    images: { type: [String], default: [] }, // gallery image URLs (index 0 = cover)
    amenities: { type: [String], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
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

// 2dsphere index enables $near / $geoWithin geo queries.
garageSchema.index({ location: '2dsphere' })

const Garage = model('Garage', garageSchema)

export default Garage
