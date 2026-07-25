import config from '../config/index.js'
import logger from '../utils/logger.js'
import ApiError from '../utils/ApiError.js'

/**
 * Central error-handling middleware. Must be mounted LAST.
 * Translates ApiError and unknown errors into the standard response shape
 * and never leaks stack traces to the client.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let statusCode = 500
  let message = 'Internal Server Error'
  let errors = []

  if (err instanceof ApiError) {
    statusCode = err.statusCode
    message = err.message
    errors = err.errors || []
  } else if (err?.name === 'ValidationError' && err?.errors) {
    // Mongoose validation error
    statusCode = 400
    message = 'Validation Error'
    errors = Object.values(err.errors).map((e) => e.message)
  } else if (err?.message) {
    message = err.message
  }

  // Log full error server-side (stack included); 5xx as error, 4xx as warn.
  const logFn = statusCode >= 500 ? logger.error.bind(logger) : logger.warn.bind(logger)
  logFn({ err, statusCode }, `${req.method} ${req.originalUrl} -> ${statusCode}`)

  // In production, hide internal 5xx details from the client.
  const clientMessage =
    statusCode >= 500 && config.isProduction ? 'Internal Server Error' : message

  res.status(statusCode).json({
    success: false,
    message: clientMessage,
    data: null,
    errors,
  })
}

export default errorHandler
