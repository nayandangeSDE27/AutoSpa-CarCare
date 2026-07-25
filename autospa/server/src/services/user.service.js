import ApiError from '../utils/ApiError.js'
import userRepository from '../repositories/user.repository.js'

/**
 * userService — the authenticated user's own profile.
 */
async function getMe(userId) {
  const user = await userRepository.findById(userId)
  if (!user) throw new ApiError(404, 'User not found')
  return user
}

async function updateMe(userId, update) {
  // Only self-editable fields.
  const allowed = {}
  for (const k of ['name', 'phone', 'avatar']) {
    if (update[k] !== undefined) allowed[k] = update[k]
  }
  return userRepository.updateById(userId, allowed)
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await userRepository.findByEmailWithPassword(
    (await userRepository.findById(userId))?.email
  )
  if (!user) throw new ApiError(404, 'User not found')
  const ok = await user.comparePassword(currentPassword)
  if (!ok) throw new ApiError(400, 'Current password is incorrect')
  await userRepository.setFields(userId, { password: newPassword })
}

export default { getMe, updateMe, changePassword }
