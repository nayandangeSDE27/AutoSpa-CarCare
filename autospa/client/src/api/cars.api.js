import api from './client.js'

export const carsApi = {
  list: () => api.get('/cars'),
  get: (id) => api.get(`/cars/${id}`),
  create: (body) => api.post('/cars', body),
  update: (id, body) => api.patch(`/cars/${id}`, body),
  remove: (id) => api.delete(`/cars/${id}`),
}

export default carsApi
