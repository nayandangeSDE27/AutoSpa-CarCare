import ApiError from '../utils/ApiError.js'

/**
 * RBAC guard. Use after `authenticate`. Allows only the listed roles,
 * otherwise rejects with a standard 403. Guards customer/garage/admin
 * routes in later phases.
 *
 *   router.get('/admin', authenticate, authorize('admin'), handler)
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'))
  }
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You do not have permission to access this resource'))
  }
  return next()
}
 
export default authorize
