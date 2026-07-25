/**
 * Pure guard logic — no React, no browser — so it's unit-testable in isolation.
 * The route components below consume these.
 */

export const DASHBOARD_BY_ROLE = {
  customer: '/customer/dashboard',
  garage_owner: '/garage/dashboard',
  admin: '/admin/dashboard',
}

export function dashboardPathForRole(role) {
  return DASHBOARD_BY_ROLE[role] || '/'
}

/**
 * Decide what a protected route should do.
 * @returns {{action:'allow'} | {action:'redirect', to:string}}
 */
export function resolveProtected({ isAuthenticated, role, allow }) {
  if (!isAuthenticated) return { action: 'redirect', to: '/login' }
  if (allow && allow.length > 0 && !allow.includes(role)) {
    return { action: 'redirect', to: dashboardPathForRole(role) }
  }
  return { action: 'allow' }
}

/**
 * Guest-only routes (login/register/...) bounce authenticated users to their
 * dashboard.
 */
export function resolveGuest({ isAuthenticated, role }) {
  if (isAuthenticated) return { action: 'redirect', to: dashboardPathForRole(role) }
  return { action: 'allow' }
}
