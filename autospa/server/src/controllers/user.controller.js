import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import userService from '../services/user.service.js'

export const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getMe(req.user.id)
  successResponse(res, { message: 'Current user', data: { user } })
})

export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateMe(req.user.id, req.body)
  successResponse(res, { message: 'Profile updated', data: { user } })
})

export const changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword(req.user.id, req.body)
  successResponse(res, { message: 'Password changed' })
})
