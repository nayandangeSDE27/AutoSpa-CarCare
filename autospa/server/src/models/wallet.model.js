import mongoose from 'mongoose'

const { Schema, model } = mongoose

// Wallet (CLAUDE.md section 7) — garageId is the ONLY link (no walletId on Garage).
const walletSchema = new Schema(
  {
    garageId: { type: Schema.Types.ObjectId, ref: 'Garage', required: true, unique: true, index: true },
    balance: { type: Number, default: 0, min: 0 },
    minimumBalance: { type: Number, default: 0 },
    currency: { type: String, default: 'usd' },
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

const Wallet = model('Wallet', walletSchema)

export default Wallet
