import mongoose from 'mongoose'

const { Schema, model } = mongoose

export const WALLET_TX_TYPES = ['CREDIT', 'DEBIT']

// WalletTransaction (CLAUDE.md section 7) — immutable ledger entry.
const walletTransactionSchema = new Schema(
  {
    walletId: { type: Schema.Types.ObjectId, ref: 'Wallet', required: true, index: true },
    garageId: { type: Schema.Types.ObjectId, ref: 'Garage', required: true, index: true },
    type: { type: String, enum: WALLET_TX_TYPES, required: true },
    amount: { type: Number, required: true, min: 0 },
    balanceAfterTransaction: { type: Number, required: true },
    description: { type: String, default: '' },
    relatedType: { type: String, default: '' }, // e.g. 'Payment', 'Topup'
    relatedId: { type: Schema.Types.ObjectId },
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

const WalletTransaction = model('WalletTransaction', walletTransactionSchema)

export default WalletTransaction
