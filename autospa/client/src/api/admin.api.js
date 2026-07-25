import api from './client.js'

export const adminApi = {
  // garages
  garages: (status) => api.get('/admin/garages', { params: status ? { status } : {} }),
  approveGarage: (id) => api.patch(`/admin/garages/${id}/approve`),
  rejectGarage: (id, reason) => api.patch(`/admin/garages/${id}/reject`, { reason }),
  suspendGarage: (id) => api.patch(`/admin/garages/${id}/suspend`),
  // users
  users: (params) => api.get('/admin/users', { params }),
  blockUser: (id) => api.patch(`/admin/users/${id}/block`),
  unblockUser: (id) => api.patch(`/admin/users/${id}/unblock`),
  // bookings monitor
  bookings: (params) => api.get('/admin/bookings', { params }),
  // reports + settings
  reports: () => api.get('/admin/reports'),
  settings: () => api.get('/admin/settings'),
  updateSettings: (body) => api.patch('/admin/settings', body),
}

export default adminApi
