import api from './client.js'

export const dashboardApi = {
  customer: () => api.get('/dashboard/customer'),
  garage: () => api.get('/dashboard/garage'),
  admin: () => api.get('/dashboard/admin'),
}

export default dashboardApi
