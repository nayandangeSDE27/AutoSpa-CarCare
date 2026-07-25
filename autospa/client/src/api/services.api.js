import api from './client.js'

export const servicesApi = {
  byGarage: (garageId) => api.get('/services', { params: { garageId } }),
  popular: () => api.get('/services/popular'),
  // owner
  mine: () => api.get('/services/mine'),
  create: (body) => api.post('/services', body),
  update: (id, body) => api.patch(`/services/${id}`, body),
  remove: (id) => api.delete(`/services/${id}`),
}

export default servicesApi
