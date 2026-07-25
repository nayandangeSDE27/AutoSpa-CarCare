import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import adminService from '../services/admin.service.js'
import settingsService from '../services/settings.service.js'

// ---- Garage verification ----
export const listGarages = asyncHandler(async (req, res) => {
  const garages = await adminService.listGarages(req.validatedQuery)
  successResponse(res, { message: 'All garages', data: { garages } })
})

export const approveGarage = asyncHandler(async (req, res) => {
  const garage = await adminService.approveGarage(req.params.id)
  successResponse(res, { message: 'Garage approved', data: { garage } })
})

export const rejectGarage = asyncHandler(async (req, res) => {
  const garage = await adminService.rejectGarage(req.params.id, req.body.reason)
  successResponse(res, { message: 'Garage rejected', data: { garage } })
})

export const suspendGarage = asyncHandler(async (req, res) => {
  const garage = await adminService.suspendGarage(req.params.id)
  successResponse(res, { message: 'Garage suspended', data: { garage } })
})

// ---- User management ----
export const listUsers = asyncHandler(async (req, res) => {
  const result = await adminService.listUsers(req.validatedQuery)
  successResponse(res, { message: 'Users', data: result })
})

export const blockUser = asyncHandler(async (req, res) => {
  const user = await adminService.blockUser(req.params.id)
  successResponse(res, { message: 'User blocked', data: { user } })
})

export const unblockUser = asyncHandler(async (req, res) => {
  const user = await adminService.unblockUser(req.params.id)
  successResponse(res, { message: 'User unblocked', data: { user } })
})

// ---- Booking monitoring ----
export const listBookings = asyncHandler(async (req, res) => {
  const result = await adminService.listBookings(req.validatedQuery)
  successResponse(res, { message: 'Platform bookings', data: result })
})

// ---- Reports + settings ----
export const getReports = asyncHandler(async (req, res) => {
  const report = await adminService.getReports()
  successResponse(res, { message: 'Platform report', data: report })
})

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.getSettings()
  successResponse(res, { message: 'Settings', data: { settings } })
})

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await settingsService.updateSettings(req.body)
  successResponse(res, { message: 'Settings updated', data: { settings } })
})
