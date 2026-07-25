import Wallet from '../models/wallet.model.js'
import WalletTransaction from '../models/walletTransaction.model.js'

/**
 * walletRepository — the ONLY module touching Wallet / WalletTransaction.
 */

function getByGarage(garageId, session = null) {
  return Wallet.findOne({ garageId }).session(session)
}

async function getOrCreate(garageId, session = null) {
  let wallet = await Wallet.findOne({ garageId }).session(session)
  if (!wallet) {
    const [created] = await Wallet.create([{ garageId }], { session })
    wallet = created
  }
  return wallet
}

/**
 * Apply a signed delta to the balance and append a ledger entry with the
 * resulting balanceAfterTransaction — all in one (optional) session.
 */
async function applyDelta(garageId, { type, amount, description, relatedType, relatedId }, session = null) {
  const wallet = await getOrCreate(garageId, session)
  const delta = type === 'DEBIT' ? -amount : amount
  wallet.balance += delta
  await wallet.save({ session })

  const [tx] = await WalletTransaction.create(
    [
      {
        walletId: wallet._id,
        garageId,
        type,
        amount,
        balanceAfterTransaction: wallet.balance,
        description: description || '',
        relatedType: relatedType || '',
        relatedId,
      },
    ],
    { session }
  )

  return { wallet, transaction: tx }
}

async function listTransactions(garageId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    WalletTransaction.find({ garageId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    WalletTransaction.countDocuments({ garageId }),
  ])
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 0 }
}

export default { getByGarage, getOrCreate, applyDelta, listTransactions }
