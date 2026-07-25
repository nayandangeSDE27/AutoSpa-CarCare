import { LayoutDashboard, Store, Users, CalendarCheck, FileBarChart, Settings } from 'lucide-react'

import DashboardLayout from './DashboardLayout.jsx'

const NAV = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Garages', to: '/admin/garages', icon: Store },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Bookings', to: '/admin/bookings', icon: CalendarCheck },
  { label: 'Reports', to: '/admin/reports', icon: FileBarChart },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
]

export default function AdminLayout() {
  return <DashboardLayout navItems={NAV} mobileMode="drawer" />
}
