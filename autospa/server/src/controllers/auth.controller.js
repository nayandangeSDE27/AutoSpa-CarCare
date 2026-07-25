import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import authService from '../services/auth.service.js'

/**
 * authController — parses the (already-validated) request, calls the service,
 * and formats the standard response. No business logic here.
 */

export const registerCustomer = asyncHandler(async (req, res) => {
  const user = await authService.register({ ...req.body, role: 'customer' })
  successResponse(res, {
    statusCode: 201,
    message: 'Registration successful. Check the server console for your verification OTP.',
    data: { user },
  })
})

export const registerGarage = asyncHandler(async (req, res) => {
  const user = await authService.register({ ...req.body, role: 'garage_owner' })
  successResponse(res, {
    statusCode: 201,
    message: 'Registration successful. Check the server console for your verification OTP.',
    data: { user },
  })
})

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmail(req.body)
  successResponse(res, { message: 'Email verified successfully', data: { user } })
})

export const resendOtp = asyncHandler(async (req, res) => {
  await authService.resendOtp(req.body)
  successResponse(res, { message: 'A new OTP has been sent (logged to the server console).' })
})

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body)
  successResponse(res, {
    message: 'Login successful',
    data: { user, accessToken, refreshToken },
  })
})

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id)
  successResponse(res, { message: 'Logged out successfully' })
})

export const refreshToken = asyncHandler(async (req, res) => {
  const { accessToken } = await authService.refreshAccessToken(req.body)
  successResponse(res, { message: 'Access token refreshed', data: { accessToken } })
})

export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body)
  successResponse(res, {
    message: 'If that email is registered, a reset code has been sent (logged to the server console).',
  })
})

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body)
  successResponse(res, { message: 'Password has been reset. Please log in again.' })
})

export const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id)
  successResponse(res, { message: 'Current user', data: { user } })
})
