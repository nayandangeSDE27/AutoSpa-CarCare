import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { bookingsApi } from '../api/bookings.api.js'

export function useBookings() {
  return useQuery({ queryKey: ['bookings'], queryFn: () => bookingsApi.list().then((d) => d.bookings) })
}

export function useUpcomingBookings() {
  return useQuery({ queryKey: ['bookings', 'upcoming'], queryFn: () => bookingsApi.upcoming().then((d) => d.bookings) })
}

export function useBooking(id) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.get(id).then((d) => d.booking),
    enabled: Boolean(id),
  })
}

export function useCreateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => bookingsApi.create(body).then((d) => d.booking),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (e) => toast.error(e.message),
  })
}

export function useCancelBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => bookingsApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['booking'] })
      toast.success('Booking cancelled')
    },
    onError: (e) => toast.error(e.message),
  })
}
