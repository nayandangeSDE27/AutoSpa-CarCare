import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import publicService from '../services/public.service.js'

export const publicStats = asyncHandler(async (req, res) => {
  const stats = await publicService.getPublicStats()
  successResponse(res, { message: 'Public stats', data: stats })
})

export const testimonials = asyncHandler(async (req, res) => {
  const reviews = await publicService.getTestimonials()
  successResponse(res, { message: 'Testimonials', data: { reviews } })
})
