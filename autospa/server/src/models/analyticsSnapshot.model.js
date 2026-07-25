import mongoose from 'mongoose'

const { Schema, model } = mongoose

// Daily platform analytics rollup produced by the cron job.
const analyticsSnapshotSchema = new Schema(
  {
    date: { type: String, required: true, unique: true }, // 'YYYY-MM-DD' (UTC)
    totalBookings: { type: Number, default: 0 },
    completedBookings: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    newUsers: { type: Number, default: 0 },
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

const AnalyticsSnapshot = model('AnalyticsSnapshot', analyticsSnapshotSchema)

export default AnalyticsSnapshot
