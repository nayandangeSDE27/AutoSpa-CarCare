import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import ApiError from '../utils/ApiError.js'
import logger from '../utils/logger.js'
import paymentService from '../services/payment.service.js'

export const createOrder = asyncHandler(async (req, res) => {
  const result = await paymentService.createOrder(req.user.id, req.body.bookingId, req.body.paymentMethod)
  successResponse(res, { statusCode: 201, message: 'Payment order created', data: result })
})

/**
 * Stripe webhook — the source of truth. Uses the raw body (mounted with
 * express.raw for this path) and verifies the Stripe signature.
 */
export const webhook = asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature']
  let event
  try {
    event = paymentService.constructEvent(req.body, signature)
  } catch (err) {
    logger.error({ err }, 'Stripe webhook signature verification failed')
    throw new ApiError(400, `Webhook signature verification failed`)
  }

  const result = await paymentService.handleStripeEvent(event)
  // Always 200 so Stripe stops retrying once we've received it.
  successResponse(res, { message: 'Webhook processed', data: result })
})

export const history = asyncHandler(async (req, res) => {
  const result = await paymentService.getHistory(req.user, req.validatedQuery)
  successResponse(res, { message: 'Payment history', data: result })
})

export const getPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPayment(req.params.id, req.user)
  successResponse(res, { message: 'Payment', data: { payment } })
})
