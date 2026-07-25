import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { garagesApi } from '../api/garages.api.js'
import { servicesApi } from '../api/services.api.js'
import { workersApi } from '../api/workers.api.js'
import { walletApi } from '../api/wallet.api.js'
import { analyticsApi } from '../api/analytics.api.js'
import { dashboardApi } from '../api/dashboard.api.js'

const toastErr = (e) => toast.error(e.message)

/* ---------- Garage profile ---------- */
export function useMyGarage() {
  // retry:false so "no garage yet" (404) resolves immediately for onboarding gating.
  return useQuery({
    queryKey: ['garage', 'mine'],
    queryFn: () => garagesApi.mine().then((d) => d.garage),
    retry: false,
  })
}

export function useCreateGarage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => garagesApi.create(body).then((d) => d.garage),
    onSuccess: (newGarage) => { 
      qc.setQueryData(['garage', 'mine'], newGarage)
      qc.invalidateQueries({ queryKey: ['garage', 'mine'] })
      toast.success('Garage created') 
    },
    onError: toastErr,
  })
}
export function useUpdateGarage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }) => garagesApi.update(id, body).then((d) => d.garage),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['garage', 'mine'] }); toast.success('Garage updated') },
    onError: toastErr,
  })
}
export function useUploadGallery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (files) => garagesApi.uploadGallery(files).then((d) => d.garage),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['garage', 'mine'] }); toast.success('Images uploaded') },
    onError: toastErr,
  })
}

/* ---------- Services (owner) ---------- */
export function useOwnerServices() {
  return useQuery({ queryKey: ['services', 'mine'], queryFn: () => servicesApi.mine().then((d) => d.services) })
}
export function useServiceMutations() {
  const qc = useQueryClient()
  const inv = () => qc.invalidateQueries({ queryKey: ['services', 'mine'] })
  return {
    create: useMutation({ mutationFn: (body) => servicesApi.create(body), onSuccess: () => { inv(); toast.success('Service added') }, onError: toastErr }),
    update: useMutation({ mutationFn: ({ id, body }) => servicesApi.update(id, body), onSuccess: () => { inv(); toast.success('Service updated') }, onError: toastErr }),
    remove: useMutation({ mutationFn: (id) => servicesApi.remove(id), onSuccess: () => { inv(); toast.success('Service removed') }, onError: toastErr }),
  }
}

/* ---------- Workers ---------- */
export function useWorkers() {
  return useQuery({ queryKey: ['workers'], queryFn: () => workersApi.list().then((d) => d.workers) })
}
export function useWorkerMutations() {
  const qc = useQueryClient()
  const inv = () => qc.invalidateQueries({ queryKey: ['workers'] })
  return {
    create: useMutation({ mutationFn: (body) => workersApi.create(body), onSuccess: () => { inv(); toast.success('Worker added') }, onError: toastErr }),
    update: useMutation({ mutationFn: ({ id, body }) => workersApi.update(id, body), onSuccess: () => { inv(); toast.success('Worker updated') }, onError: toastErr }),
    remove: useMutation({ mutationFn: (id) => workersApi.remove(id), onSuccess: () => { inv(); toast.success('Worker removed') }, onError: toastErr }),
    setStatus: useMutation({ mutationFn: ({ id, status }) => workersApi.setStatus(id, status), onSuccess: inv, onError: toastErr }),
  }
}

/* ---------- Wallet ---------- */
export function useWallet() {
  return useQuery({ queryKey: ['wallet'], queryFn: () => walletApi.get().then((d) => d.wallet) })
}
export function useWalletTransactions() {
  return useQuery({ queryKey: ['wallet', 'tx'], queryFn: () => walletApi.transactions({ limit: 100 }) })
}
export function useTopup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (amount) => walletApi.topup(amount),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['wallet'] }); toast.success('Wallet topped up') },
    onError: toastErr,
  })
}

/* ---------- Analytics + dashboard ---------- */
export function useGarageAnalytics() {
  return useQuery({ queryKey: ['analytics', 'garage'], queryFn: () => analyticsApi.garage() })
}
export function useGarageDashboard() {
  return useQuery({ queryKey: ['dashboard', 'garage'], queryFn: () => dashboardApi.garage() })
}
