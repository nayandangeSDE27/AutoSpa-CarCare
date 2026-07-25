import ApiError from '../utils/ApiError.js'

/**
 * 404 handler. Mounted after all routes and before the error handler, so it
 * forwards a typed error and the response uses the same standard shape.
 */
export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

export default notFound
