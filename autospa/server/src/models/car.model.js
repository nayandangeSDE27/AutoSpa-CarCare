import mongoose from 'mongoose'

const { Schema, model } = mongoose

// Cars (CLAUDE.md section 7) — NO qrCode field.
const carSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, min: 1900, max: 2100 },
    licensePlate: { type: String, required: true, trim: true, uppercase: true },
    color: { type: String, trim: true, default: '' },
    fuelType: { type: String, trim: true, default: '' },
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

const Car = model('Car', carSchema)

export default Car
