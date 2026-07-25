import express from 'express'
import cors from 'cors'

import config from './config/index.js'
import asyncHandler from './utils/asyncHandler.js'
import { successResponse } from './utils/apiResponse.js'
import rateLimiter from './middlewares/rateLimiter.js'
import notFound from './middlewares/notFound.js'
import errorHandler from './middlewares/errorHandler.js'
import apiRoutes from './routes/index.js'
import { webhook as stripeWebhook } from './controllers/payment.controller.js'

/**
 * Builds the Express app (middleware + routes + error handling). No I/O side
 * effects — the DB connection and listen live in server.js so tests can import
 * this app against in-memory infrastructure.
 */
const app = express()

// --- Stripe webhook: raw body, mounted BEFORE express.json (source of truth) ---
app.post('/api/payments/webhook', express.raw({ type: '*/*' }), stripeWebhook)

// --- Core middleware ---
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({ origin: config.clientUrl, credentials: true }))

// --- Rate limiting (mounted on the API surface) ---
app.use('/api', rateLimiter)

// --- Health check ---
app.get(
  '/api/health',
  asyncHandler(async (req, res) => {
    successResponse(res, {
      statusCode: 200,
      message: 'Server is healthy',
      data: { status: 'ok', uptime: process.uptime() },
    })
  })
)

// --- API routes ---
app.use('/api', apiRoutes)

// --- 404 + error handling (MUST be last) ---
app.use(notFound)
app.use(errorHandler)

export default app
