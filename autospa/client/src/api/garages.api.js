import api from './client.js'

export const garagesApi = {
  list: () => api.get('/garages'),
  featured: () => api.get('/garages/featured'),
  nearby: ({ lng, lat, radius = 15000 }) =>
    api.get('/garages/nearby', { params: { lng, lat, radius } }),
  get: (id) => api.get(`/garages/${id}`),
  slots: (garageId, { date, serviceIds }) =>
    api.get(`/garages/${garageId}/slots`, { params: { date, serviceIds: serviceIds.join(',') } }),

  // owner
  mine: () => api.get('/garages/mine'),
  create: (body) => api.post('/garages', body),
  update: (id, body) => api.patch(`/garages/${id}`, body),
  uploadGallery: (files) => {
    const fd = new FormData()
    for (const f of files) fd.append('images', f)
    return api.post('/garages/gallery/upload', fd)
  },
}

export default garagesApi
