import { z } from 'zod'

/**
 * Zod schemas for every auth endpoint body. The `validate` middleware runs
 * these and rejects invalid input with the standard error response.
 */

const email = z.string().trim().toLowerCase().email('A valid email is required')
const password = z.string().min(8, 'Password must be at least 8 characters')
const otp = z
  .string()
  .regex(/^\d{6}$/, 'OTP must be a 6-digit code')

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email,
  phone: z.string().trim().min(6, 'A valid phone number is required'),
  password,
})

export const verifyEmailSchema = z.object({
  email,
  otp,
})

export const resendOtpSchema = z.object({
  email,
})

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken is required'),
})

export const forgotPasswordSchema = z.object({
  email,
})

export const resetPasswordSchema = z.object({
  email,
  otp,
  newPassword: password,
})
