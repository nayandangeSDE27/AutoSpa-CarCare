/**
 * Typed application error. Throw this from anywhere (services, controllers)
 * and the central error handler will translate it into the standard response.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode HTTP status code
   * @param {string} message    human-readable message
   * @param {Array}  errors     optional list of detailed error entries
   */
  constructor(statusCode, message, errors = []) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errors = errors
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

export default ApiError
