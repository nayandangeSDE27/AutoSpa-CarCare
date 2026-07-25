import rateLimit from 'express-rate-limit'
import config from '../config/index.js'

/**
 * Basic rate limiter, ready to mount. Uses the standard response shape on 429.
 */
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  // Don't throttle the in-process test harness (many requests, one IP).
  skip: () => config.env === 'test',
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests, please try again later.',
      data: null,
      errors: [],
    })
  },
})

export default rateLimiter
