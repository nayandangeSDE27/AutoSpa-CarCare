import api from './client.js'

export const usersApi = {
  me: () => api.get('/users/me'),
  updateMe: (body) => api.patch('/users/me', body),
  changePassword: (body) => api.post('/users/me/change-password', body),
}

export default usersApi
