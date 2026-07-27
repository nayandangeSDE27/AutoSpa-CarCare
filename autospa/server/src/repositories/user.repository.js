import User from '../models/user.model.js'

/**
 * userRepository — the ONLY module that touches the User model directly.
 * Services depend on this, never on Mongoose.
 */

function create(data, session = null) {
  return User.create([data], { session }).then((docs) => docs[0])
}

function findById(id) {
  return User.findById(id)
}

function findByEmail(email) {
  return User.findOne({ email: email?.toLowerCase() })
}

/**
 * Find by email including the password hash (for credential verification).
 */
function findByEmailWithPassword(email) {
  return User.findOne({ email: email?.toLowerCase() }).select('+password')
}

function updateById(id, update) {
  return User.findByIdAndUpdate(id, update, { returnDocument: 'after', runValidators: true })
}

/**
 * Load a user document, set new fields and save() so pre-save hooks run
 * (needed when changing the password so it gets re-hashed).
 */
async function setFields(id, fields) {
  const user = await User.findById(id).select('+password')
  if (!user) return null
  Object.assign(user, fields)
  await user.save()
  return user
}

function existsByEmail(email) {
  return User.exists({ email: email?.toLowerCase() })
}

// ----- Admin: filtered + paginated listing and aggregates -----

async function findPaginated(filter = {}, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ])
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 0 }
}

function count(filter = {}) {
  return User.countDocuments(filter)
}

async function countByRole() {
  const rows = await User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }])
  return Object.fromEntries(rows.map((r) => [r._id, r.count]))
}

export default {
  create,
  findById,
  findByEmail,
  findByEmailWithPassword,
  updateById,
  setFields,
  existsByEmail,
  findPaginated,
  count,
  countByRole,
}
