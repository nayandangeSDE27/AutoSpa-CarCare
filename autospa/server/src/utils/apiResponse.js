/**
 * Standard API response shape (CLAUDE.md section 3):
 *   { success, message, data, errors }
 *
 * Every response — success or error — uses these exact four keys.
 */

export function successResponse(res, { statusCode = 200, message = 'Success', data = null } = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    errors: null,
  })
}

export function errorResponse(res, { statusCode = 500, message = 'Error', errors = [] } = {}) {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors,
  })
}
