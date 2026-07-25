import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { usersApi } from '../api/users.api.js'
import { dashboardApi } from '../api/dashboard.api.js'
import { useAuthStore } from '../stores/auth.store.js'

export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: () => usersApi.me().then((d) => d.user) })
}

export function useUpdateMe() {
  const qc = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  return useMutation({
    mutationFn: (body) => usersApi.updateMe(body).then((d) => d.user),
    onSuccess: (user) => {
      setUser(user)
      qc.invalidateQueries({ queryKey: ['me'] })
      toast.success('Profile updated')
    },
    onError: (e) => toast.error(e.message),
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (body) => usersApi.changePassword(body),
    onSuccess: () => toast.success('Password changed'),
    onError: (e) => toast.error(e.message),
  })
}

export function useCustomerDashboard() {
  return useQuery({ queryKey: ['dashboard', 'customer'], queryFn: () => dashboardApi.customer() })
}
