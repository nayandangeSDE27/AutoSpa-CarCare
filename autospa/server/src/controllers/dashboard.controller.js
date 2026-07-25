import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import dashboardService from '../services/dashboard.service.js'

export const garageDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getGarageDashboard(req.user.id)
  successResponse(res, { message: 'Garage dashboard', data })
})

export const adminDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getAdminDashboard()
  successResponse(res, { message: 'Admin dashboard', data })
})

export const customerDashboard = asyncHandler(async (req, res) => {
  const data = await dashboardService.getCustomerDashboard(req.user.id)
  successResponse(res, { message: 'Customer dashboard', data })
})
