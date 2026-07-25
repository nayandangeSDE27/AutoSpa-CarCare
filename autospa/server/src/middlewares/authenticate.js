import ApiError from '../utils/ApiError.js'
import { verifyAccessToken } from '../utils/jwt.js'

/**
 * Verify the Bearer access token and attach req.user = { id, role }.
 * Rejects with a standard 401 if the token is missing or invalid.
 */
const authenticate = (req, res, next) => {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'Authentication required'))
  }

  try {
    const payload = verifyAccessToken(token)
    req.user = { id: payload.userId, role: payload.role }

    //  console.log("Authenticated User:", req.user);

    return next()
  } catch {
    return next(new ApiError(401, 'Invalid or expired access token'))
  }
}

export default authenticate
