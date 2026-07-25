import { LayoutDashboard, Store, CalendarCheck, Car, Star, Bell, User, Settings } from 'lucide-react'

import DashboardLayout from './DashboardLayout.jsx'

const NAV = [
  { label: 'Dashboard', to: '/customer/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Garages', to: '/customer/garages', icon: Store },
  { label: 'Bookings', to: '/customer/bookings', icon: CalendarCheck },
  { label: 'My Cars', to: '/customer/cars', icon: Car },
  { label: 'Reviews', to: '/customer/reviews', icon: Star },
  { label: 'Notifications', to: '/customer/notifications', icon: Bell },
  { label: 'Profile', to: '/customer/profile', icon: User },
  { label: 'Settings', to: '/customer/settings', icon: Settings },
]

// Five key items for the mobile bottom-tab bar.
const TABS = [
  { label: 'Home', to: '/customer/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Garages', to: '/customer/garages', icon: Store },
  { label: 'Bookings', to: '/customer/bookings', icon: CalendarCheck },
  { label: 'Cars', to: '/customer/cars', icon: Car },
  { label: 'Profile', to: '/customer/profile', icon: User },
]

export default function CustomerLayout() {
  return <DashboardLayout navItems={NAV} mobileMode="tabs" bottomTabs={TABS} />
}
