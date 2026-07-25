import mongoose from 'mongoose'

const { Schema, model } = mongoose

export const WORKER_STATUS = ['available', 'busy', 'off']

// Workers (CLAUDE.md section 7). `todayJobs` is intentionally NOT stored — it is
// derived from bookings at read time.
const workerSchema = new Schema(
  {
    garageId: {
      type: Schema.Types.ObjectId,
      ref: 'Garage',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: '' },
    speciality: { type: String, trim: true, default: '' },
    status: { type: String, enum: WORKER_STATUS, default: 'available' },
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

const Worker = model('Worker', workerSchema)

export default Worker
