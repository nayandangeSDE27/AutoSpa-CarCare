import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import analyticsService from '../services/analytics.service.js'

export const garageAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getGarageAnalytics(req.user.id)
  successResponse(res, { message: 'Garage analytics', data })
})

export const adminAnalytics = asyncHandler(async (req, res) => {
  const data = await analyticsService.getAdminAnalytics()
  successResponse(res, { message: 'Admin analytics', data })
})
