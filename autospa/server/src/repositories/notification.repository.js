import Notification from '../models/notification.model.js'

/**
 * notificationRepository — the ONLY module that touches the Notification model.
 */

function create(data) {
  return Notification.create(data)
}

async function findPaginated(userId, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit
  const filter = { userId }
  const [items, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId, isRead: false }),
  ])
  return { items, total, unread, page, limit, totalPages: Math.ceil(total / limit) || 0 }
}

function findById(id) {
  return Notification.findById(id)
}

function markRead(id) {
  return Notification.findByIdAndUpdate(id, { isRead: true }, { returnDocument: 'after' })
}

function markAllRead(userId) {
  return Notification.updateMany({ userId, isRead: false }, { isRead: true })
}

function deleteById(id) {
  return Notification.findByIdAndDelete(id)
}

export default {
  create,
  findPaginated,
  findById,
  markRead,
  markAllRead,
  deleteById,
}
