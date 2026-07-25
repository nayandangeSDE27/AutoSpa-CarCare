import { Navigate, Outlet } from 'react-router-dom'

import { useAuthStore } from '../stores/auth.store.js'
import { resolveProtected, resolveGuest } from './guards.js'

/**
 * Guards a route group. `allow` is an array of roles permitted here.
 * - not authenticated  → /login
 * - wrong role         → own dashboard
 */
export function ProtectedRoute({ allow }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const role = useAuthStore((s) => s.user?.role)

  const result = resolveProtected({ isAuthenticated, role, allow })
  if (result.action === 'redirect') return <Navigate to={result.to} replace />
  return <Outlet />
}

/**
 * Guest-only wrapper for auth pages: a logged-in user is bounced to their
 * dashboard.
 */
export function GuestRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const role = useAuthStore((s) => s.user?.role)

  const result = resolveGuest({ isAuthenticated, role })
  if (result.action === 'redirect') return <Navigate to={result.to} replace />
  return <Outlet />
}

export default ProtectedRoute
