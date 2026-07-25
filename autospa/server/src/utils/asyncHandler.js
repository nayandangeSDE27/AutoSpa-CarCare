/**
 * Wraps an async route handler so rejected promises are forwarded to Express's
 * error middleware — no try/catch needed in controllers.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export default asyncHandler
