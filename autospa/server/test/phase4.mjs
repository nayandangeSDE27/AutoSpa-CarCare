/**
 * Phase 4 suite: garage-owner features. Seeds an owner+approved garage+services
 * +workers and a customer with a car who places a PENDING booking, then drives
 * the full lifecycle and ownership/negative cases against the in-memory harness.
 */
import User from '../src/models/user.model.js'
import Garage from '../src/models/garage.model.js'
import Service from '../src/models/service.model.js'
import Worker from '../src/models/worker.model.js'

const allWeekOpen = Array.from({ length: 7 }, (_, day) => ({ day, open: '00:00', close: '23:59', isClosed: false }))

export async function runPhase4(ctx) {
  const { req, ok, section, log } = ctx
  const login = async (email) => (await req('POST', '/auth/login', { body: { email, password: 'Passw0rd!' } })).json.data.accessToken

  section('SEED (in-memory) — owner1 + approved garage + services + workers; owner2; customer + car')
  const owner1 = await User.create({ name: 'Owner One', email: 'o1@example.com', phone: '+1', password: 'Passw0rd!', role: 'garage_owner', isEmailVerified: true })
  await User.create({ name: 'Owner Two', email: 'o2@example.com', phone: '+2', password: 'Passw0rd!', role: 'garage_owner', isEmailVerified: true })
  await User.create({ name: 'Cust', email: 'c1@example.com', phone: '+3', password: 'Passw0rd!', role: 'customer', isEmailVerified: true })

  const g1 = await Garage.create({
    name: 'Owner1 Garage', owner: owner1._id,
    location: { type: 'Point', coordinates: [77.5946, 12.9716] },
    serviceBays: 2, workingHours: allWeekOpen, slotDurationMinutes: 30,
    verificationStatus: 'APPROVED',
  })
  const [basic] = await Service.create([
    { garageId: g1._id, name: 'Basic Wash', price: 20, durationMinutes: 30 },
    { garageId: g1._id, name: 'Interior Clean', price: 50, durationMinutes: 45 },
  ])
  const [w1] = await Worker.create([
    { garageId: g1._id, name: 'Worker A', speciality: 'wash' },
    { garageId: g1._id, name: 'Worker B', speciality: 'detail' },
  ])

  const t1 = await login('o1@example.com')
  const t2 = await login('o2@example.com')
  const tc = await login('c1@example.com')

  // customer car + PENDING booking for TODAY (so dashboard "today" counts it)
  const carId = (await req('POST', '/cars', { token: tc, body: { make: 'Toyota', model: 'Yaris', licensePlate: 'P4-1' } })).json.data.car._id
  const today = new Date().toISOString().slice(0, 10)
  const mk = await req('POST', '/bookings', { token: tc, body: { garageId: g1._id, carId, serviceIds: [basic._id], startTime: `${today}T09:00:00.000Z` } })
  ok('customer places PENDING booking', mk.status === 201 && mk.json.data.booking.status === 'PENDING')
  const bId = mk.json.data.booking._id

  // ---------------- GARAGE PROFILE ----------------
  section('GARAGE PROFILE — owner2 creates garage (PENDING); owner1 edits own; ownership enforced')
  let r = await req('POST', '/garages', { token: t2, body: { name: 'Owner2 Garage', location: { lng: 77.6, lat: 12.98 }, serviceBays: 1 } })
  console.log('  owner2 create ->', r.status, 'verificationStatus:', r.json.data?.garage?.verificationStatus)
  ok('create garage 201 + verificationStatus PENDING', r.status === 201 && r.json.data.garage.verificationStatus === 'PENDING')

  r = await req('PATCH', `/garages/${g1._id}`, { token: t1, body: { description: 'Now with premium detailing' } })
  ok('owner1 edits own garage', r.status === 200 && r.json.data.garage.description === 'Now with premium detailing')

  r = await req('PATCH', `/garages/${g1._id}`, { token: t2, body: { description: 'hijack' } })
  console.log('  owner2 edits owner1 garage ->', r.status, r.json.message)
  ok('owner2 CANNOT edit owner1 garage (403)', r.status === 403)

  r = await req('POST', '/garages/gallery', { token: t1, body: { images: ['https://cdn.example.com/a.jpg', 'https://cdn.example.com/b.jpg'] } })
  ok('gallery images added (mock upload)', r.status === 200 && r.json.data.garage.images.length === 2)

  r = await req('POST', '/garages/documents', { token: t1, body: { documents: [{ type: 'business_license', url: 'https://cdn.example.com/lic.pdf' }] } })
  ok('documents submitted, status PENDING', r.status === 201 && r.json.data.document.status === 'PENDING')

  // ---------------- SERVICES (owner CRUD) ----------------
  section('SERVICES — owner CRUD + ownership')
  r = await req('POST', '/services', { token: t1, body: { name: 'Wax', price: 35, durationMinutes: 20 } })
  ok('owner1 creates service', r.status === 201 && r.json.data.service.garageId === String(g1._id))
  const newSvc = r.json.data.service._id
  r = await req('PATCH', `/services/${newSvc}`, { token: t1, body: { price: 40 } })
  ok('owner1 edits own service', r.status === 200 && r.json.data.service.price === 40)
  r = await req('PATCH', `/services/${newSvc}`, { token: t2, body: { price: 1 } })
  ok('owner2 CANNOT edit owner1 service (403)', r.status === 403)
  r = await req('DELETE', `/services/${newSvc}`, { token: t2 })
  ok('owner2 CANNOT delete owner1 service (403)', r.status === 403)
  r = await req('DELETE', `/services/${newSvc}`, { token: t1 })
  ok('owner1 deletes own service', r.status === 200)

  // ---------------- WORKERS ----------------
  section('WORKERS — CRUD, status toggle, derived todayJobs, ownership')
  r = await req('POST', '/workers', { token: t1, body: { name: 'Worker C', speciality: 'tyres' } })
  ok('owner1 creates worker', r.status === 201)
  const wC = r.json.data.worker._id
  r = await req('GET', '/workers', { token: t1 })
  ok('list workers includes derived todayJobs', r.status === 200 && r.json.data.workers.every((w) => typeof w.todayJobs === 'number'))
  r = await req('PATCH', `/workers/${wC}/status`, { token: t1, body: { status: 'off' } })
  ok('toggle worker status', r.status === 200 && r.json.data.worker.status === 'off')
  r = await req('PATCH', `/workers/${wC}`, { token: t2, body: { name: 'hack' } })
  ok('owner2 CANNOT edit owner1 worker (403)', r.status === 403)
  r = await req('DELETE', `/workers/${wC}`, { token: t1 })
  ok('owner1 deletes own worker', r.status === 200)

  // owner2 needs a worker in ITS garage for the cross-garage assign test
  const w2foreign = (await req('POST', '/workers', { token: t2, body: { name: 'Foreign W' } })).json.data.worker._id

  // ---------------- BOOKING LIFECYCLE ----------------
  section('BOOKING MANAGEMENT — role-branched reads + state machine')
  r = await req('GET', '/bookings', { token: t1 })
  ok('owner GET /bookings returns THEIR garage bookings', r.status === 200 && r.json.data.bookings.some((b) => b._id === bId))

  r = await req('PATCH', `/bookings/${bId}/status`, { token: t1, body: { status: 'COMPLETED' } })
  console.log('  illegal PENDING->COMPLETED ->', r.status, r.json.message)
  ok('ILLEGAL transition PENDING->COMPLETED rejected (400)', r.status === 400)

  r = await req('PATCH', `/bookings/${bId}/status`, { token: t1, body: { status: 'ACCEPTED' } })
  ok('accept -> ACCEPTED', r.status === 200 && r.json.data.booking.status === 'ACCEPTED')
  // read the generated serviceOtp (owner may see it)
  r = await req('GET', `/bookings/${bId}`, { token: t1 })
  const otp = r.json.data.booking.serviceOtp
  console.log('  generated serviceOtp:', otp)
  ok('serviceOtp generated on ACCEPTED (6 digits)', /^\d{6}$/.test(otp || ''))

  r = await req('PATCH', `/bookings/${bId}/assign-worker`, { token: t1, body: { workerId: w2foreign } })
  console.log('  assign worker from another garage ->', r.status, r.json.message)
  ok('assigning ANOTHER garage\'s worker rejected (400)', r.status === 400)

  r = await req('PATCH', `/bookings/${bId}/assign-worker`, { token: t1, body: { workerId: String(w1._id) } })
  ok('assign own available worker -> WORKER_ASSIGNED', r.status === 200 && r.json.data.booking.status === 'WORKER_ASSIGNED')

  r = await req('PATCH', `/bookings/${bId}/start`, { token: t1, body: { otp: '000000' } })
  console.log('  start with WRONG otp ->', r.status, r.json.message)
  ok('start with WRONG otp rejected (400)', r.status === 400)

  r = await req('PATCH', `/bookings/${bId}/start`, { token: t1, body: { otp } })
  ok('start with RIGHT otp -> IN_PROGRESS', r.status === 200 && r.json.data.booking.status === 'IN_PROGRESS')

  r = await req('PATCH', `/bookings/${bId}/complete`, { token: t1, body: { afterImages: ['https://cdn.example.com/after.jpg'] } })
  ok('complete -> COMPLETED + afterImages', r.status === 200 && r.json.data.booking.status === 'COMPLETED' && r.json.data.booking.afterImages.length === 1)

  // ---------------- DASHBOARD ----------------
  section('DASHBOARD — counts after the lifecycle')
  r = await req('GET', '/dashboard/garage', { token: t1 })
  console.log('  dashboard:', JSON.stringify(r.json.data))
  ok('todayRevenue = 20 (the COMPLETED booking)', r.json.data.todayRevenue === 20)
  ok('todayBookings = 1', r.json.data.todayBookings === 1)
  ok('pendingRequests = 0 (booking completed)', r.json.data.pendingRequests === 0)
  ok('availableWorkers = 2 (worker freed on completion)', r.json.data.availableWorkers === 2)
}
