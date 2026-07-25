import ApiError from '../utils/ApiError.js'

/**
 * Request-validation middleware. Runs a Zod schema against req.body, replaces
 * req.body with the parsed (coerced/trimmed) result, and rejects invalid
 * input via ApiError -> the standard error response shape.
 */
function runValidation(schema, source, req, next) {
  const result = schema.safeParse(req[source])
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))
    return next(new ApiError(400, 'Validation failed', errors))
  }
  // Store parsed/coerced data separately so we don't fight Express getters.
  if (source === 'query') req.validatedQuery = result.data
  else req[source] = result.data
  return next()
}

const validate = (schema) => (req, res, next) => runValidation(schema, 'body', req, next)

export const validateQuery = (schema) => (req, res, next) =>
  runValidation(schema, 'query', req, next)

export default validate
