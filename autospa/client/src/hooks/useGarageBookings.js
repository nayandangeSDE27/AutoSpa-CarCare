import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { bookingsApi } from '../api/bookings.api.js'

// Garage owners share GET /bookings + /bookings/:id (role-branched on the server).
export function useGarageBookings() {
  return useQuery({ queryKey: ['bookings', 'garage'], queryFn: () => bookingsApi.list().then((d) => d.bookings) })
}

export function useGarageBooking(id) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingsApi.get(id).then((d) => d.booking),
    enabled: Boolean(id),
  })
}

export function useBookingLifecycle() {
  const qc = useQueryClient()
  const inv = () => {
    qc.invalidateQueries({ queryKey: ['bookings'] })
    qc.invalidateQueries({ queryKey: ['booking'] })
    qc.invalidateQueries({ queryKey: ['dashboard'] })
    qc.invalidateQueries({ queryKey: ['workers'] })
    qc.invalidateQueries({ queryKey: ['wallet'] })
  }
  const err = (e) => toast.error(e.message)
  return {
    setStatus: useMutation({ mutationFn: ({ id, status }) => bookingsApi.updateStatus(id, status).then((d) => d.booking), onSuccess: (b) => { inv(); toast.success(`Booking ${b.status.toLowerCase()}`) }, onError: err }),
    assignWorker: useMutation({ mutationFn: ({ id, workerId }) => bookingsApi.assignWorker(id, workerId).then((d) => d.booking), onSuccess: () => { inv(); toast.success('Worker assigned') }, onError: err }),
    start: useMutation({ mutationFn: ({ id, otp, beforeImages = [] }) => bookingsApi.start(id, otp, beforeImages).then((d) => d.booking), onSuccess: () => { inv(); toast.success('Job started') }, onError: err }),
    complete: useMutation({ mutationFn: ({ id, afterImages }) => bookingsApi.complete(id, afterImages).then((d) => d.booking), onSuccess: () => { inv(); toast.success('Marked complete') }, onError: err }),
    createWalkIn: useMutation({ mutationFn: (body) => bookingsApi.createWalkIn(body).then((d) => d.booking), onSuccess: () => { inv(); toast.success('Walk-in booking created') }, onError: err }),
  }
}
