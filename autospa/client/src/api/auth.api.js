import api from './client.js'

/**
 * authApi — the reference resource module. Every endpoint returns the already
 * unwrapped `data` payload (the response interceptor strips the envelope).
 * Other resource modules (cars, garages, …) follow this exact pattern later.
 */
export const authApi = {
  registerCustomer: (body) => api.post('/auth/register/customer', body),
  registerGarage: (body) => api.post('/auth/register/garage', body),
  verifyEmail: (body) => api.post('/auth/verify-email', body),
  resendOtp: (body) => api.post('/auth/resend-otp', body),
  login: (body) => api.post('/auth/login', body),
  logout: () => api.post('/auth/logout'),
  refresh: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  me: () => api.get('/auth/me'),
  forgotPassword: (body) => api.post('/auth/forgot-password', body),
  resetPassword: (body) => api.post('/auth/reset-password', body),
}

export default authApi
