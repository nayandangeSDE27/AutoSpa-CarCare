import api from './client.js'

export const bookingsApi = {
  list: () => api.get('/bookings'),
  upcoming: () => api.get('/bookings/upcoming'),
  get: (id) => api.get(`/bookings/${id}`),
  create: (body) => api.post('/bookings', body),
  createWalkIn: (body) => api.post('/bookings/garage/walkin-bookings', body),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  reschedule: (id, body) => api.patch(`/bookings/${id}/reschedule`, body),
  // invoice is a binary download — handled directly with the token where needed
  invoiceUrl: (id) => `/bookings/${id}/invoice`,

  // garage-owner lifecycle actions
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  assignWorker: (id, workerId) => api.patch(`/bookings/${id}/assign-worker`, { workerId }),
  start: (id, otp, beforeImages = []) => api.patch(`/bookings/${id}/start`, { otp, beforeImages }),
  complete: (id, afterImages = []) => api.patch(`/bookings/${id}/complete`, { afterImages }),
}

export default bookingsApi
