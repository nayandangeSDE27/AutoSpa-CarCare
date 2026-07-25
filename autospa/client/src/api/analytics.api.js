import api from './client.js'

export const analyticsApi = {
  garage: () => api.get('/analytics/garage'),
  admin: () => api.get('/analytics/admin'),
}

export default analyticsApi
