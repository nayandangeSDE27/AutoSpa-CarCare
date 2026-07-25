import {
  LayoutDashboard,
  CalendarCheck,
  Wrench,
  Users,
  BarChart3,
  Star,
  Wallet,
  User,
  Settings,
} from 'lucide-react'
import { Navigate } from 'react-router-dom'

import DashboardLayout from './DashboardLayout.jsx'
import { useMyGarage } from '../hooks/useOwner.js'

const NAV = [
  { label: 'Dashboard', to: '/garage/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Bookings', to: '/garage/bookings', icon: CalendarCheck },
  { label: 'Services', to: '/garage/services', icon: Wrench },
  { label: 'Workers', to: '/garage/workers', icon: Users },
  { label: 'Analytics', to: '/garage/analytics', icon: BarChart3 },
  { label: 'Reviews', to: '/garage/reviews', icon: Star },
  { label: 'Wallet', to: '/garage/wallet', icon: Wallet },
  { label: 'Profile', to: '/garage/profile', icon: User },
  { label: 'Settings', to: '/garage/settings', icon: Settings },
]

export default function GarageLayout() {
  const { data: garage, isLoading } = useMyGarage()

  // Until we know whether a garage exists, hold rendering (avoids a flash of the
  // dashboard firing garage-dependent requests that would 404).
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-content-secondary">
        Loading…
      </div>
    )
  }

  // A garage owner with no garage yet is guided to onboarding — not dropped onto
  // pages that error with "You do not have a garage yet".
  if (!garage) {
    return <Navigate to="/garage/onboarding" replace />
  }

  return <DashboardLayout navItems={NAV} mobileMode="drawer" />
}
