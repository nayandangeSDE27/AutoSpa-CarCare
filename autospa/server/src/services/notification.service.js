import ApiError from '../utils/ApiError.js'
import notificationRepository from '../repositories/notification.repository.js'
import userRepository from '../repositories/user.repository.js'
import { emitToUser } from '../realtime/index.js'

/**
 * notificationService — the single place that both persists a Notification row
 * AND emits the realtime event. Domain services call notify()/notifyAdmins()
 * so logic isn't duplicated.
 */

/**
 * @param {string} userId    recipient
 * @param {object} opts
 * @param {string} opts.event   socket event name (e.g. 'bookingAccepted')
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {string} [opts.relatedType]
 * @param {string} [opts.relatedId]
 * @param {object} [opts.data]  extra payload merged into the socket emit
 */
async function notify(userId, { event, title, message = '', relatedType = '', relatedId, data = {} }) {
  const notification = await notificationRepository.create({
    userId,
    type: event,
    title,
    message,
    relatedType,
    relatedId,
  })

  // Domain event + a generic notificationReceived, both to the user's room.
  emitToUser(userId, event, { ...data, notification })
  emitToUser(userId, 'notificationReceived', { notification })

  return notification
}

async function notifyAdmins(opts) {
  const { items } = await userRepository.findPaginated({ role: 'admin' }, { page: 1, limit: 100 })
  return Promise.all(items.map((admin) => notify(admin._id, opts)))
}

// ---- caller-facing (notification centre) ----
function list(userId, pagination) {
  return notificationRepository.findPaginated(userId, pagination)
}

async function markRead(id, userId) {
  const n = await notificationRepository.findById(id)
  if (!n || n.userId.toString() !== userId.toString()) throw new ApiError(404, 'Notification not found')
  return notificationRepository.markRead(id)
}

function markAllRead(userId) {
  return notificationRepository.markAllRead(userId)
}

async function remove(id, userId) {
  const n = await notificationRepository.findById(id)
  if (!n || n.userId.toString() !== userId.toString()) throw new ApiError(404, 'Notification not found')
  await notificationRepository.deleteById(id)
}

export default { notify, notifyAdmins, list, markRead, markAllRead, remove }
