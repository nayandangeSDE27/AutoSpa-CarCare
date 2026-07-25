// Small formatting helpers shared across customer pages.

export const GST_RATE = 0.18

export function currency(n) {
  return `₹${Number(n || 0).toFixed(2)}`
}

export function withGst(subtotal) {
  const gst = Math.round(subtotal * GST_RATE * 100) / 100
  return { subtotal, gst, total: Math.round((subtotal + gst) * 100) / 100 }
}

export function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

export function minutesToLabel(mins) {
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

// Haversine distance in km between two [lng,lat]-ish points.
export function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Is a garage open right now, per its workingHours (UTC wall-clock, dev)?
export function isOpenNow(garage) {
  if (!garage?.workingHours?.length) return null
  const now = new Date()
  const day = now.getUTCDay()
  const wh = garage.workingHours.find((w) => w.day === day)
  if (!wh || wh.isClosed) return false
  const mins = now.getUTCHours() * 60 + now.getUTCMinutes()
  const toMin = (s) => {
    const [h, m] = String(s).split(':').map(Number)
    return h * 60 + m
  }
  return mins >= toMin(wh.open) && mins <= toMin(wh.close)
}

// Booking status -> label + tailwind classes for a badge.
export const STATUS_META = {
  PENDING: { label: 'Pending', cls: 'bg-accent-light text-primary-deep' },
  ACCEPTED: { label: 'Accepted', cls: 'bg-accent-mid text-primary-deep' },
  WORKER_ASSIGNED: { label: 'Worker assigned', cls: 'bg-accent-mid text-primary-deep' },
  IN_PROGRESS: { label: 'In progress', cls: 'bg-primary text-primary-foreground' },
  COMPLETED: { label: 'Completed', cls: 'bg-primary text-primary-foreground' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-danger/10 text-danger' },
  REJECTED: { label: 'Rejected', cls: 'bg-danger/10 text-danger' },
  NO_SHOW: { label: 'No show', cls: 'bg-danger/10 text-danger' },
}

// The OTP visibility rule: shown only while ACCEPTED or WORKER_ASSIGNED.
export const OTP_VISIBLE_STATUSES = ['ACCEPTED', 'WORKER_ASSIGNED']
export function shouldShowOtp(booking) {
  return Boolean(booking?.serviceOtp) && OTP_VISIBLE_STATUSES.includes(booking?.status)
}
