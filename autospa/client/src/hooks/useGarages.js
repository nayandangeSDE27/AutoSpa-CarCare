import { useQuery } from '@tanstack/react-query'

import { garagesApi } from '../api/garages.api.js'
import { servicesApi } from '../api/services.api.js'

export function useGarages(enabled = true) {
  return useQuery({ 
    queryKey: ['garages'], 
    queryFn: () => garagesApi.list().then((d) => d.garages),
    enabled 
  })
}

export function useFeaturedGarages() {
  return useQuery({ queryKey: ['garages', 'featured'], queryFn: () => garagesApi.featured().then((d) => d.garages) })
}

export function useNearbyGarages(coords) {
  return useQuery({
    queryKey: ['garages', 'nearby', coords?.lat, coords?.lng],
    queryFn: () => garagesApi.nearby(coords).then((d) => d.garages),
    enabled: Boolean(coords?.lat && coords?.lng),
  })
}

export function useGarage(id) {
  return useQuery({
    queryKey: ['garage', id],
    queryFn: () => garagesApi.get(id).then((d) => d.garage),
    enabled: Boolean(id),
  })
}

export function useGarageServices(garageId) {
  return useQuery({
    queryKey: ['services', garageId],
    queryFn: () => servicesApi.byGarage(garageId).then((d) => d.services),
    enabled: Boolean(garageId),
  })
}

export function useSlots(garageId, { date, serviceIds }) {
  return useQuery({
    queryKey: ['slots', garageId, date, [...(serviceIds || [])].sort().join(',')],
    queryFn: () => garagesApi.slots(garageId, { date, serviceIds }),
    enabled: Boolean(garageId && date && serviceIds?.length),
  })
}
