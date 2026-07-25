import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { reviewsApi } from '../api/reviews.api.js'

export function useMyReviews() {
  return useQuery({ queryKey: ['reviews', 'mine'], queryFn: () => reviewsApi.mine().then((d) => d.reviews) })
}

export function usePendingReviews() {
  return useQuery({ queryKey: ['reviews', 'pending'], queryFn: () => reviewsApi.pending().then((d) => d.bookings) })
}

export function useGarageReviews(garageId) {
  return useQuery({
    queryKey: ['reviews', 'garage', garageId],
    queryFn: () => reviewsApi.byGarage(garageId).then((d) => d.reviews),
    enabled: Boolean(garageId),
  })
}

export function useReplyToReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reply }) => reviewsApi.reply(id, reply),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', 'garage'] })
      toast.success('Reply posted')
    },
    onError: (e) => toast.error(e.message),
  })
}

function invalidate(qc) {
  qc.invalidateQueries({ queryKey: ['reviews'] })
}

export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => reviewsApi.create(body),
    onSuccess: () => {
      invalidate(qc)
      toast.success('Review submitted')
    },
    onError: (e) => toast.error(e.message),
  })
}

export function useUpdateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }) => reviewsApi.update(id, body),
    onSuccess: () => {
      invalidate(qc)
      toast.success('Review updated')
    },
    onError: (e) => toast.error(e.message),
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => reviewsApi.remove(id),
    onSuccess: () => {
      invalidate(qc)
      toast.success('Review deleted')
    },
    onError: (e) => toast.error(e.message),
  })
}
