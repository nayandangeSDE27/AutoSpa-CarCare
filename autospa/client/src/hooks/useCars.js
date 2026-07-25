import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { carsApi } from '../api/cars.api.js'

export function useCars() {
  return useQuery({ queryKey: ['cars'], queryFn: () => carsApi.list().then((d) => d.cars) })
}

export function useCar(id) {
  return useQuery({
    queryKey: ['car', id],
    queryFn: () => carsApi.get(id).then((d) => d.car),
    enabled: Boolean(id),
  })
}

export function useCreateCar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => carsApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cars'] })
      toast.success('Car added')
    },
    onError: (e) => toast.error(e.message),
  })
}

export function useUpdateCar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }) => carsApi.update(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cars'] })
      toast.success('Car updated')
    },
    onError: (e) => toast.error(e.message),
  })
}

export function useDeleteCar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => carsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cars'] })
      toast.success('Car removed')
    },
    onError: (e) => toast.error(e.message),
  })
}
