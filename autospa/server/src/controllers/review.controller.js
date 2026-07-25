import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import reviewService from '../services/review.service.js'

// public
export const testimonials = asyncHandler(async (req, res) => {
  const reviews = await reviewService.getTestimonials()
  successResponse(res, { message: 'Testimonials', data: { reviews } })
})

export const listByGarage = asyncHandler(async (req, res) => {
  const reviews = await reviewService.listByGarage(req.params.garageId)
  successResponse(res, { message: 'Garage reviews', data: { reviews } })
})

// customer
export const listMine = asyncHandler(async (req, res) => {
  const reviews = await reviewService.listMine(req.user.id)
  successResponse(res, { message: 'My reviews', data: { reviews } })
})

export const listPending = asyncHandler(async (req, res) => {
  const bookings = await reviewService.listPending(req.user.id)
  successResponse(res, { message: 'Pending reviews', data: { bookings } })
})

export const createReview = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview(req.user.id, req.body)
  successResponse(res, { statusCode: 201, message: 'Review submitted', data: { review } })
})

export const updateReview = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview(req.params.id, req.user.id, req.body)
  successResponse(res, { message: 'Review updated', data: { review } })
})

export const deleteReview = asyncHandler(async (req, res) => {
  await reviewService.deleteReview(req.params.id, req.user.id)
  successResponse(res, { message: 'Review deleted' })
})

// garage owner
export const replyToReview = asyncHandler(async (req, res) => {
  const review = await reviewService.replyToReview(req.params.id, req.user.id, req.body.reply)
  successResponse(res, { message: 'Reply posted', data: { review } })
})
