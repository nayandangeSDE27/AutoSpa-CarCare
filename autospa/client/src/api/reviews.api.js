import api from './client.js'

export const reviewsApi = {
  mine: () => api.get('/reviews/mine'),
  pending: () => api.get('/reviews/pending'),
  byGarage: (garageId) => api.get(`/reviews/garage/${garageId}`),
  create: (body) => api.post('/reviews', body),
  update: (id, body) => api.patch(`/reviews/${id}`, body),
  remove: (id) => api.delete(`/reviews/${id}`),
  reply: (id, reply) => api.patch(`/reviews/${id}/reply`, { reply }),
}

export default reviewsApi
