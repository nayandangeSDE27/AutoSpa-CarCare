/**
 * Phase 5 suite: admin features + public endpoints, against the in-memory harness.
 */
import User from '../src/models/user.model.js'
import Garage from '../src/models/garage.model.js'
import Car from '../src/models/car.model.js'
import Booking from '../src/models/booking.model.js'
import Review from '../src/models/review.model.js'

const point = (lng, lat) => ({ type: 'Point', coordinates: [lng, lat] })
const bare = (baseUrl) => (path) => fetch(baseUrl + path) // no-token GET

export async function runPhase5(ctx) {
  const { req, ok, section, log } = ctx
  const login = async (email) => (await req('POST', '/auth/login', { body: { email, password: 'Passw0rd!' } })).json.data.accessToken

  section('SEED (in-memory) — admin, users, PENDING garages, bookings, reviews')
  const admin = await User.create({ name: 'Admin', email: 'adminnayan@gmail.com', phone: '7389049902', password: 'Admin@2003', role: 'admin', isEmailVerified: true })
  const custA = await User.create({ name: 'Cust A', email: 'ca@example.com', phone: '+1', password: 'Passw0rd!', role: 'customer', isEmailVerified: true })
  const custB = await User.create({ name: 'Cust B', email: 'cb@example.com', phone: '+2', password: 'Passw0rd!', role: 'customer', isEmailVerified: true })
  const owner = await User.create({ name: 'Owner', email: 'ow@example.com', phone: '+3', password: 'Passw0rd!', role: 'garage_owner', isEmailVerified: true })

  const gA = await Garage.create({ name: 'Alpha Garage', owner: owner._id, location: point(77.5946, 12.9716), serviceBays: 2, verificationStatus: 'PENDING' })
  const gB = await Garage.create({ name: 'Beta Garage', owner: owner._id, location: point(77.60, 12.98), serviceBays: 1, verificationStatus: 'PENDING' })

  const car = await Car.create({ owner: custA._id, make: 'Toyota', model: 'Yaris', licensePlate: 'ADM-1' })
  const snap = [{ serviceId: gA._id, nameAtBooking: 'Basic Wash', priceAtBooking: 100, durationAtBooking: 30 }]
  const bk = (n, status, paymentStatus, total) => ({
    bookingNumber: n, customerId: custA._id, carId: car._id, garageId: gA._id, services: snap,
    bookingDate: new Date('2026-08-03T00:00:00.000Z'), startTime: new Date('2026-08-03T10:00:00.000Z'),
    endTime: new Date('2026-08-03T10:30:00.000Z'), totalAmount: total, status, paymentStatus,
  })
  await Booking.create([
    bk('ASP-T-0001', 'COMPLETED', 'PAID', 100),
    bk('ASP-T-0002', 'PENDING', 'PENDING', 50),
    bk('ASP-T-0003', 'CANCELLED', 'PENDING', 20),
  ])
  await Review.create([
    { customerId: custA._id, garageId: gA._id, customerName: 'Cust A', rating: 5, comment: 'Fantastic!' },
    { customerId: custB._id, garageId: gA._id, customerName: 'Cust B', rating: 4, comment: 'Great job' },
    { customerId: custA._id, garageId: gA._id, customerName: 'Cust A', rating: 3, comment: 'Meh' }, // excluded from testimonials
  ])

  const tAdmin = await login('adminnayan@gmail.com')
  const tCust = await login('ca@example.com')

  // ---------------- GARAGE VERIFICATION ----------------
  section('ADMIN — garage verification (list PENDING, approve, reject) + customer visibility')
  let r = await req('GET', '/admin/garages?status=PENDING', { token: tAdmin })
  console.log('  PENDING garages:', r.json.data.garages.map((g) => g.name))
  ok('lists all PENDING garages (2)', r.status === 200 && r.json.data.garages.length === 2)

  r = await req('GET', '/admin/garages', { token: tAdmin })
  ok('admin sees ALL garages regardless of status', r.status === 200 && r.json.data.garages.length === 2)

  r = await req('PATCH', `/admin/garages/${gA._id}/approve`, { token: tAdmin })
  ok('approve -> APPROVED', r.status === 200 && r.json.data.garage.verificationStatus === 'APPROVED')

  r = await req('PATCH', `/admin/garages/${gB._id}/reject`, { token: tAdmin, body: { reason: 'Incomplete documents' } })
  ok('reject -> REJECTED + reason stored', r.status === 200 && r.json.data.garage.verificationStatus === 'REJECTED' && r.json.data.garage.rejectionReason === 'Incomplete documents')

  r = await req('PATCH', `/admin/garages/${gB._id}/reject`, { token: tAdmin, body: {} })
  ok('reject without reason rejected (400)', r.status === 400)

  // customer visibility (Phase 3 listing)
  r = await req('GET', '/garages', { token: tCust })
  const names = r.json.data.garages.map((g) => g.name)
  console.log('  customer sees:', names)
  ok('APPROVED garage now visible to customers', names.includes('Alpha Garage'))
  ok('REJECTED garage NOT visible to customers', !names.includes('Beta Garage'))

  // ---------------- USER MANAGEMENT ----------------
  section('ADMIN — user management (list/filter/paginate, block/unblock + login gate)')
  r = await req('GET', '/admin/users?role=customer&page=1&limit=10', { token: tAdmin })
  console.log('  customers:', r.json.data.items.map((u) => u.email), '| total:', r.json.data.total)
  ok('lists customers, paginated, no password', r.status === 200 && r.json.data.items.length === 2 && r.json.data.items.every((u) => u.password === undefined))
  ok('pagination meta present', typeof r.json.data.total === 'number' && typeof r.json.data.totalPages === 'number')

  r = await req('PATCH', `/admin/users/${custB._id}/block`, { token: tAdmin })
  ok('block user -> status blocked', r.status === 200 && r.json.data.user.status === 'blocked')

  r = await req('POST', '/auth/login', { body: { email: 'cb@example.com', password: 'Passw0rd!' } })
  console.log('  blocked login ->', r.status, r.json.message)
  ok('blocked user CANNOT log in (403)', r.status === 403)

  r = await req('PATCH', `/admin/users/${custB._id}/unblock`, { token: tAdmin })
  ok('unblock user -> status active', r.status === 200 && r.json.data.user.status === 'active')
  r = await req('POST', '/auth/login', { body: { email: 'cb@example.com', password: 'Passw0rd!' } })
  ok('unblocked user CAN log in again (200)', r.status === 200)

  // ---------------- BOOKING MONITORING ----------------
  section('ADMIN — booking monitoring (platform-wide, filters)')
  r = await req('GET', '/admin/bookings', { token: tAdmin })
  ok('lists all platform bookings (3)', r.status === 200 && r.json.data.total === 3)
  r = await req('GET', '/admin/bookings?status=COMPLETED', { token: tAdmin })
  ok('filter by status=COMPLETED (1)', r.status === 200 && r.json.data.items.length === 1)

  // ---------------- SETTINGS + REPORTS ----------------
  section('ADMIN — settings + reports')
  r = await req('GET', '/admin/reports', { token: tAdmin })
  console.log('  reports:', JSON.stringify(r.json.data))
  ok('reports users total = 4', r.json.data.users.total === 4)
  ok('reports users byRole (2 customers)', r.json.data.users.byRole.customer === 2)
  ok('reports garages byVerificationStatus (APPROVED 1, REJECTED 1)', r.json.data.garages.byVerificationStatus.APPROVED === 1 && r.json.data.garages.byVerificationStatus.REJECTED === 1)
  ok('reports bookings byStatus', r.json.data.bookings.byStatus.COMPLETED === 1 && r.json.data.bookings.byStatus.PENDING === 1)
  ok('reports revenue from COMPLETED+PAID = 100', r.json.data.revenue.totalRevenue === 100)
  ok('default commissionRate 0.10 -> commission 10', r.json.data.revenue.commissionRate === 0.1 && r.json.data.revenue.totalCommission === 10)

  r = await req('PATCH', '/admin/settings', { token: tAdmin, body: { commissionRate: 0.15 } })
  ok('update commissionRate -> 0.15', r.status === 200 && r.json.data.settings.commissionRate === 0.15)
  r = await req('GET', '/admin/reports', { token: tAdmin })
  ok('commissionRate persists + recomputes commission (15)', r.json.data.revenue.commissionRate === 0.15 && r.json.data.revenue.totalCommission === 15)

  // ---------------- ADMIN DASHBOARD ----------------
  section('ADMIN — dashboard cards')
  r = await req('GET', '/dashboard/admin', { token: tAdmin })
  console.log('  dashboard:', JSON.stringify(r.json.data))
  ok('totalUsers = 4', r.json.data.totalUsers === 4)
  ok('totalGarages = 2', r.json.data.totalGarages === 2)
  ok('activeBookings = 1 (only PENDING is active)', r.json.data.activeBookings === 1)
  ok('pendingVerifications = 0 (both resolved)', r.json.data.pendingVerifications === 0)

  // ---------------- RBAC: non-admin blocked ----------------
  section('RBAC — customer token rejected (403) from every /admin route')
  const adminRoutes = [
    ['GET', '/admin/garages'],
    ['PATCH', `/admin/garages/${gA._id}/approve`],
    ['GET', '/admin/users'],
    ['PATCH', `/admin/users/${custA._id}/block`],
    ['GET', '/admin/bookings'],
    ['GET', '/admin/reports'],
    ['PATCH', '/admin/settings'],
    ['GET', '/dashboard/admin'],
  ]
  let all403 = true
  for (const [m, p] of adminRoutes) {
    // eslint-disable-next-line no-await-in-loop
    const res = await req(m, p, { token: tCust, body: {} })
    if (res.status !== 403) { all403 = false; log(`  ${m} ${p} -> ${res.status} (expected 403)`) }
  }
  ok('customer gets 403 on all admin routes', all403)

  // ---------------- PUBLIC (no auth) ----------------
  section('PUBLIC — stats + testimonials (NO token)')
  let res = await bare(ctx.baseUrl || 'http://localhost:5100/api')('/stats/public')
  let json = await res.json()
  console.log('  /stats/public ->', res.status, JSON.stringify(json.data))
  ok('public stats no-auth 200', res.status === 200)
  ok('approvedGarages=1, completedBookings=1, totalCustomers=2', json.data.approvedGarages === 1 && json.data.completedBookings === 1 && json.data.totalCustomers === 2)

  res = await bare(ctx.baseUrl || 'http://localhost:5100/api')('/reviews/testimonials')
  json = await res.json()
  console.log('  /reviews/testimonials ->', res.status, 'count:', json.data.reviews.length)
  ok('testimonials no-auth 200', res.status === 200)
  ok('only high-rating reviews returned (2 of 3)', json.data.reviews.length === 2 && json.data.reviews.every((rv) => rv.rating >= 4))
}
