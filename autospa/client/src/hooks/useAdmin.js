import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { adminApi } from '../api/admin.api.js'
import { dashboardApi } from '../api/dashboard.api.js'
import { analyticsApi } from '../api/analytics.api.js'

const err = (e) => toast.error(e.message)

/* ---------- Dashboard / analytics / reports ---------- */
export function useAdminDashboard() {
  return useQuery({ queryKey: ['admin', 'dashboard'], queryFn: () => dashboardApi.admin() })
}
export function useAdminAnalytics() {
  return useQuery({ queryKey: ['admin', 'analytics'], queryFn: () => analyticsApi.admin() })
}
export function useAdminReports() {
  return useQuery({ queryKey: ['admin', 'reports'], queryFn: () => adminApi.reports() })
}

/* ---------- Garages ---------- */
export function useAdminGarages(status) {
  return useQuery({ queryKey: ['admin', 'garages', status || 'all'], queryFn: () => adminApi.garages(status).then((d) => d.garages) })
}
export function useGarageModeration() {
  const qc = useQueryClient()
  const inv = () => { qc.invalidateQueries({ queryKey: ['admin', 'garages'] }); qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] }) }
  return {
    approve: useMutation({ mutationFn: (id) => adminApi.approveGarage(id), onSuccess: () => { inv(); toast.success('Garage approved') }, onError: err }),
    reject: useMutation({ mutationFn: ({ id, reason }) => adminApi.rejectGarage(id, reason), onSuccess: () => { inv(); toast.success('Garage rejected') }, onError: err }),
    suspend: useMutation({ mutationFn: (id) => adminApi.suspendGarage(id), onSuccess: () => { inv(); toast.success('Garage suspended') }, onError: err }),
  }
}

/* ---------- Users ---------- */
export function useAdminUsers(params) {
  return useQuery({ queryKey: ['admin', 'users', params], queryFn: () => adminApi.users(params) })
}
export function useUserModeration() {
  const qc = useQueryClient()
  const inv = () => qc.invalidateQueries({ queryKey: ['admin', 'users'] })
  return {
    block: useMutation({ mutationFn: (id) => adminApi.blockUser(id), onSuccess: () => { inv(); toast.success('User blocked') }, onError: err }),
    unblock: useMutation({ mutationFn: (id) => adminApi.unblockUser(id), onSuccess: () => { inv(); toast.success('User unblocked') }, onError: err }),
  }
}

/* ---------- Bookings monitor ---------- */
export function useAdminBookings(params) {
  return useQuery({ queryKey: ['admin', 'bookings', params], queryFn: () => adminApi.bookings(params) })
}

/* ---------- Settings ---------- */
export function useAdminSettings() {
  return useQuery({ queryKey: ['admin', 'settings'], queryFn: () => adminApi.settings().then((d) => d.settings) })
}
export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => adminApi.updateSettings(body).then((d) => d.settings),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin'] }); toast.success('Settings updated') },
    onError: err,
  })
}
