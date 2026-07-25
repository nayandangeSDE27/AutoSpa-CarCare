import walletRepository from '../repositories/wallet.repository.js'
import { getOwnerGarageOrThrow } from './garage.service.js'

/**
 * walletService — garage-owner wallet + ledger. Every balance change goes
 * through the repository's applyDelta, which writes a WalletTransaction with
 * balanceAfterTransaction.
 */

async function getWallet(ownerId) {
  const garage = await getOwnerGarageOrThrow(ownerId)
  return walletRepository.getOrCreate(garage._id)
}

async function listTransactions(ownerId, pagination) {
  const garage = await getOwnerGarageOrThrow(ownerId)
  return walletRepository.listTransactions(garage._id, pagination)
}

async function topUp(ownerId, amount) {
  const garage = await getOwnerGarageOrThrow(ownerId)
  const { wallet } = await walletRepository.applyDelta(garage._id, {
    type: 'CREDIT',
    amount,
    description: 'Manual top-up (mock)',
    relatedType: 'Topup',
  })
  return wallet
}

/**
 * Credit a garage's earnings (used by the payment webhook, inside its
 * transaction). Returns { wallet, transaction }.
 */
function creditEarnings(garageId, amount, { relatedType, relatedId, description } = {}, session = null) {
  return walletRepository.applyDelta(
    garageId,
    { type: 'CREDIT', amount, description: description || 'Booking earnings', relatedType, relatedId },
    session
  )
}

export default { getWallet, listTransactions, topUp, creditEarnings }
