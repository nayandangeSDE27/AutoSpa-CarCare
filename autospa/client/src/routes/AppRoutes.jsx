import { Routes, Route, Navigate } from 'react-router-dom'

import PublicLayout from '../layouts/PublicLayout.jsx'
import CustomerLayout from '../layouts/CustomerLayout.jsx'
import GarageLayout from '../layouts/GarageLayout.jsx'
import AdminLayout from '../layouts/AdminLayout.jsx'
import { ProtectedRoute, GuestRoute } from './ProtectedRoute.jsx'
import PagePlaceholder from '../pages/PagePlaceholder.jsx'
import NotFound from '../pages/NotFound.jsx'
import Home from '../pages/public/Home.jsx'
import Services from '../pages/public/Services.jsx'
import HowItWorks from '../pages/public/HowItWorks.jsx'
import About from '../pages/public/About.jsx'
import Developer from '../pages/public/Developer.jsx'

// Auth pages (7b)
import Login from '../pages/auth/Login.jsx'
import RegisterCustomer from '../pages/auth/RegisterCustomer.jsx'
import RegisterGarage from '../pages/auth/RegisterGarage.jsx'
import ForgotPassword from '../pages/auth/ForgotPassword.jsx'
import ResetPassword from '../pages/auth/ResetPassword.jsx'

// Customer pages (7c)
import Dashboard from '../pages/customer/Dashboard.jsx'
import Garages from '../pages/customer/Garages.jsx'
import GarageDetails from '../pages/customer/GarageDetails.jsx'
import BookingWizard from '../pages/customer/BookingWizard.jsx'
import BookingSuccess from '../pages/customer/BookingSuccess.jsx'
import BookingDetails from '../pages/customer/BookingDetails.jsx'
import BookingHistory from '../pages/customer/BookingHistory.jsx'
import Cars from '../pages/customer/Cars.jsx'
import CarForm from '../pages/customer/CarForm.jsx'
import Notifications from '../pages/customer/Notifications.jsx'
import Reviews from '../pages/customer/Reviews.jsx'
import Profile from '../pages/customer/Profile.jsx'
import Settings from '../pages/customer/Settings.jsx'

// Garage-owner pages (7d)
import GarageDashboard from '../pages/garage/Dashboard.jsx'
import GarageProfile from '../pages/garage/Profile.jsx'
import EditGarage from '../pages/garage/EditGarage.jsx'
import GarageServices from '../pages/garage/Services.jsx'
import GarageWorkers from '../pages/garage/Workers.jsx'
import GarageBookings from '../pages/garage/Bookings.jsx'
import GarageBookingDetails from '../pages/garage/BookingDetails.jsx'
import GarageAnalytics from '../pages/garage/Analytics.jsx'
import GarageReviews from '../pages/garage/Reviews.jsx'
import GarageWallet from '../pages/garage/Wallet.jsx'
import GarageSettings from '../pages/garage/Settings.jsx'
import GarageOnboarding from '../pages/garage/Onboarding.jsx'

// Admin pages (7e)
import AdminDashboard from '../pages/admin/Dashboard.jsx'
import AdminGarages from '../pages/admin/Garages.jsx'
import AdminUsers from '../pages/admin/Users.jsx'
import AdminBookings from '../pages/admin/Bookings.jsx'
import AdminReports from '../pages/admin/Reports.jsx'
import AdminSettings from '../pages/admin/Settings.jsx'

const P = (title) => <PagePlaceholder title={title} />

export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------- PUBLIC (marketing + auth) ---------- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="/developer" element={<Developer />} />
        <Route path="/contact" element={P('Contact')} />
        <Route path="/faq" element={P('FAQ')} />
        <Route path="/privacy-policy" element={P('Privacy Policy')} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register/customer" element={<RegisterCustomer />} />
          <Route path="/register/garage" element={<RegisterGarage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Route>
      </Route>

      {/* ---------- CUSTOMER ---------- */}
      <Route element={<ProtectedRoute allow={['customer']} />}>
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<Navigate to="/customer/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="garages" element={<Garages />} />
          <Route path="garages/:garageId" element={<GarageDetails />} />
          <Route path="bookings" element={<BookingHistory />} />
          <Route path="bookings/new" element={<BookingWizard />} />
          <Route path="bookings/success" element={<BookingSuccess />} />
          <Route path="bookings/:bookingId" element={<BookingDetails />} />
          <Route path="cars" element={<Cars />} />
          <Route path="cars/new" element={<CarForm />} />
          <Route path="cars/:carId" element={<CarForm />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      {/* ---------- GARAGE OWNER (7d) ---------- */}
      <Route element={<ProtectedRoute allow={['garage_owner']} />}>
        {/* Standalone (no dashboard shell) — where garage-less owners are sent */}
        <Route path="/garage/onboarding" element={<GarageOnboarding />} />
        <Route path="/garage" element={<GarageLayout />}>
          <Route index element={<Navigate to="/garage/dashboard" replace />} />
          <Route path="dashboard" element={<GarageDashboard />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="bookings" element={<GarageBookings />} />
          <Route path="bookings/:bookingId" element={<GarageBookingDetails />} />
          <Route path="services" element={<GarageServices />} />
          <Route path="workers" element={<GarageWorkers />} />
          <Route path="analytics" element={<GarageAnalytics />} />
          <Route path="reviews" element={<GarageReviews />} />
          <Route path="wallet" element={<GarageWallet />} />
          <Route path="profile" element={<GarageProfile />} />
          <Route path="profile/edit" element={<EditGarage />} />
          <Route path="settings" element={<GarageSettings />} />
        </Route>
      </Route>

      {/* ---------- ADMIN (7e) ---------- */}
      <Route element={<ProtectedRoute allow={['admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="garages" element={<AdminGarages />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
