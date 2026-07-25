import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import walletService from '../services/wallet.service.js'

export const getWallet = asyncHandler(async (req, res) => {
  const wallet = await walletService.getWallet(req.user.id)
  successResponse(res, { message: 'Wallet', data: { wallet } })
})

export const getTransactions = asyncHandler(async (req, res) => {
  const result = await walletService.listTransactions(req.user.id, req.validatedQuery)
  successResponse(res, { message: 'Wallet transactions', data: result })
})

export const topUp = asyncHandler(async (req, res) => {
  const wallet = await walletService.topUp(req.user.id, req.body.amount)
  successResponse(res, { message: 'Wallet topped up', data: { wallet } })
})
