import api from './client.js'

export const walletApi = {
  get: () => api.get('/wallet'),
  transactions: (params) => api.get('/wallet/transactions', { params }),
  topup: (amount) => api.post('/wallet/topup', { amount }),
}

export default walletApi
