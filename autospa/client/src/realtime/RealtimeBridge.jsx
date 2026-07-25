import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { useSocketEvent } from '../hooks/useSocket.js'

/**
 * Central place that turns socket events into TanStack Query cache
 * invalidations (socket = the nudge, Query = the source of truth) plus a few
 * tasteful, deduped toasts. Mounted once at the app root — pages then update
 * live simply by re-fetching their queries. No per-page socket wiring needed.
 */
const EVENTS = [
  // ---- customer booking lifecycle ----
  { name: 'bookingAccepted', keys: [['booking'], ['bookings'], ['dashboard']], toast: ['success', 'Booking accepted — your OTP is ready'] },
  { name: 'bookingRejected', keys: [['booking'], ['bookings'], ['dashboard']], toast: ['error', 'Your booking was rejected'] },
  { name: 'workerAssigned', keys: [['booking'], ['bookings'], ['dashboard']], toast: ['success', 'A worker was assigned'] },
  { name: 'bookingStarted', keys: [['booking'], ['bookings'], ['dashboard']], toast: ['success', 'Your service has started'] },
  { name: 'bookingCompleted', keys: [['booking'], ['bookings'], ['dashboard']], toast: ['success', 'Service completed'] },
  // ---- garage owner ----
  { name: 'newBooking', keys: [['bookings'], ['dashboard']], toast: ['success', 'New booking received'] },
  { name: 'bookingCancelled', keys: [['bookings'], ['dashboard']], toast: ['error', 'A booking was cancelled'] },
  { name: 'paymentReceived', keys: [['wallet'], ['dashboard']], toast: ['success', 'Payment received'] },
  { name: 'walletUpdated', keys: [['wallet']] },
  // ---- admin ----
  { name: 'garageRegistered', keys: [['admin']], toast: ['success', 'New garage registered'] },
  { name: 'newReport', keys: [['admin']], toast: ['success', 'New report ready'] },
  // ---- all roles: the generic ping accompanies every domain event ----
  { name: 'notificationReceived', keys: [['notifications']] },
]

// Debounce/dedupe: skip an identical toast fired within 2s.
let lastToast = { key: '', t: 0 }
function pushToast(key, [type, msg]) {
  const now = Date.now()
  if (lastToast.key === key && now - lastToast.t < 2000) return
  lastToast = { key, t: now }
  ;(type === 'error' ? toast.error : toast.success)(msg, { id: key })
}

export default function RealtimeBridge() {
  const qc = useQueryClient()

  // Constant-length loop → stable hook order every render.
  EVENTS.forEach((e) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSocketEvent(e.name, () => {
      e.keys.forEach((key) => qc.invalidateQueries({ queryKey: key }))
      if (e.toast) pushToast(e.name, e.toast)
    })
  })

  return null
}
