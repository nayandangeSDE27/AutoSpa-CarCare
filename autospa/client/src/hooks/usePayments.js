import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import api from '../api/client.js'

export function useCreatePaymentOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ bookingId, paymentMethod }) => {
      const data = await api.post('/payments/create-order', { bookingId, paymentMethod })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking'] })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (error) => {
      toast.error(error?.message || 'Could not start payment')
    },
  })
}
