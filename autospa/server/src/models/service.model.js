import mongoose from 'mongoose'

const { Schema, model } = mongoose

// Services (CLAUDE.md section 7) — offered by a garage.
const serviceSchema = new Schema(
  {
    garageId: {
      type: Schema.Types.ObjectId,
      ref: 'Garage',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    durationMinutes: { type: Number, required: true, min: 1 },
    category: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    bookingsCount: { type: Number, default: 0 },
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

const Service = model('Service', serviceSchema)

export default Service
