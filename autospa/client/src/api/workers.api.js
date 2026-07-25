import api from './client.js'

export const workersApi = {
  list: () => api.get('/workers'),
  create: (body) => api.post('/workers', body),
  update: (id, body) => api.patch(`/workers/${id}`, body),
  remove: (id) => api.delete(`/workers/${id}`),
  setStatus: (id, status) => api.patch(`/workers/${id}/status`, { status }),
}

export default workersApi
