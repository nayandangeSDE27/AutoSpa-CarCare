import { Router } from 'express'

import validate from '../middlewares/validate.js'
import authenticate from '../middlewares/authenticate.js'
import * as authController from '../controllers/auth.controller.js'
import {
  registerSchema,
  verifyEmailSchema,
  resendOtpSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js'

const router = Router()

// --- Registration ---
router.post('/register/customer', validate(registerSchema), authController.registerCustomer)
router.post('/register/garage', validate(registerSchema), authController.registerGarage)

// --- Email verification ---
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail)
router.post('/resend-otp', validate(resendOtpSchema), authController.resendOtp)

// --- Session ---
router.post('/login', validate(loginSchema), authController.login)
router.post('/logout', authenticate, authController.logout)
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken)

// --- Password reset ---
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword)

// --- Current user (protected) ---
router.get('/me', authenticate, authController.me)

export default router
