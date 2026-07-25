import mongoose from 'mongoose'

const { Schema, model } = mongoose

// Platform Settings (CLAUDE.md section 7). A single global document.
const settingsSchema = new Schema(
  {
    key: { type: String, default: 'global', unique: true },
    commissionRate: { type: Number, default: 0.1, min: 0, max: 1 },
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

const Settings = model('Settings', settingsSchema)

export default Settings
