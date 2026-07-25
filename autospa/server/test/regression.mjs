/**
 * Regression suite: re-verifies Phase 2 (auth) and Phase 3 (cars, garages,
 * nearby, slots, concurrency-safe bookings) against the in-memory harness.
 */
import mongoose from 'mongoose'

import User from '../src/models/user.model.js'
import Garage from '../src/models/garage.model.js'
import Service from '../src/models/service.model.js'

const BASE_LNG = 77.5946
const BASE_LAT = 12.9716
const allWeekOpen = Array.from({ length: 7 }, (_, day) => ({ day, open: '09:00', close: '18:00', isClosed: false }))

async function seedGarages(ownerId) {
  const defs = [
    { name: 'Sparkle Auto Spa', bays: 2, featured: true, offset: 0.0 },
    { name: 'Shine Masters', bays: 2, featured: false, offset: 0.02 },
    { name: 'Gleam Garage', bays: 3, featured: false, offset: 0.05 },
  ]
  const out = []
  for (const d of defs) {
    // eslint-disable-next-line no-await-in-loop
    const g = await Garage.create({
      name: d.name, owner: ownerId, address: `${d.name}, Test City`,
      location: { type: 'Point', coordinates: [BASE_LNG, BASE_LAT + d.offset] },
      serviceBays: d.bays, workingHours: allWeekOpen, slotDurationMinutes: 30,
      verificationStatus: 'APPROVED', isFeatured: d.featured, rating: 4.5,
    })
    // eslint-disable-next-line no-await-in-loop
    const svc = await Service.create([
      { garageId: g._id, name: 'Basic Wash', price: 20, durationMinutes: 30, isPopular: true, bookingsCount: 50 },
      { garageId: g._id, name: 'Interior Clean', price: 50, durationMinutes: 45, isPopular: true, bookingsCount: 30 },
    ])
    out.push({ g, svc })
  }
  return out
}

export async function runRegression(ctx) {
  const { req, redis, ok, section, log } = ctx

  // ---- AUTH ----
  section('REGRESSION / AUTH — register → verify → login → me → refresh → logout')
  let r = await req('POST', '/auth/register/customer', {
    body: { name: 'Reg Cust', email: 'reg@example.com', phone: '+15551234567', password: 'Passw0rd!' },
  })
  ok('register 201, no password leaked', r.status === 201 && r.json.data.user.password === undefined)

  const otp = await redis.get('auth:otp:verify:reg@example.com')
  ok('OTP present in (mock) Redis', /^\d{6}$/.test(otp || ''))

  r = await req('POST', '/auth/login', { body: { email: 'reg@example.com', password: 'Passw0rd!' } })
  ok('login before verify rejected (403)', r.status === 403)

  r = await req('POST', '/auth/verify-email', { body: { email: 'reg@example.com', otp } })
  ok('verify-email 200', r.status === 200 && r.json.data.user.isEmailVerified === true)

  r = await req('POST', '/auth/login', { body: { email: 'reg@example.com', password: 'Passw0rd!' } })
  ok('login 200 with tokens', r.status === 200 && !!r.json.data.accessToken && !!r.json.data.refreshToken)
  const access = r.json.data.accessToken
  const refresh = r.json.data.refreshToken

  r = await req('GET', '/auth/me', { token: access })
  ok('me 200', r.status === 200 && r.json.data.user.email === 'reg@example.com')

  r = await req('POST', '/auth/refresh-token', { body: { refreshToken: refresh } })
  ok('refresh 200 issues access', r.status === 200 && !!r.json.data.accessToken)

  await req('POST', '/auth/logout', { token: access })
  r = await req('POST', '/auth/refresh-token', { body: { refreshToken: refresh } })
  ok('refresh after logout rejected (401)', r.status === 401)

  r = await req('POST', '/auth/login', { body: { email: 'reg@example.com', password: 'nope' } })
  ok('bad password rejected (401)', r.status === 401)

  // ---- PHASE 3 ----
  section('REGRESSION / PHASE 3 — cars, garages, nearby, slots, concurrency')

  // seed an owner + garages directly, then two verified customers via helper
  const owner = await User.create({ name: 'Owner', email: 'own3@example.com', phone: '+1', password: 'Passw0rd!', role: 'garage_owner', isEmailVerified: true })
  const seeded = await seedGarages(owner._id)
  const sparkle = seeded.find((s) => s.g.name === 'Sparkle Auto Spa')
  const basic = sparkle.svc.find((s) => s.name === 'Basic Wash')

  const customer = await User.create({ name: 'Cust3', email: 'cust3@example.com', phone: '+2', password: 'Passw0rd!', role: 'customer', isEmailVerified: true })
  const other = await User.create({ name: 'Other3', email: 'other3@example.com', phone: '+3', password: 'Passw0rd!', role: 'customer', isEmailVerified: true })
  const tokC = (await req('POST', '/auth/login', { body: { email: customer.email, password: 'Passw0rd!' } })).json.data.accessToken
  const tokO = (await req('POST', '/auth/login', { body: { email: other.email, password: 'Passw0rd!' } })).json.data.accessToken

  r = await req('POST', '/cars', { token: tokC, body: { make: 'Toyota', model: 'Corolla', licensePlate: 'reg-1' } })
  ok('create car 201', r.status === 201)
  const carId = r.json.data.car._id
  r = await req('GET', `/cars/${carId}`, { token: tokO })
  ok('other customer blocked from car (404)', r.status === 404)

  r = await req('GET', '/garages', { token: tokC })
  ok('lists 3 approved garages', r.status === 200 && r.json.data.garages.length === 3)
  r = await req('GET', '/garages/nearby?lng=77.5946&lat=12.9716&radius=10000', { token: tokC })
  ok('nearby nearest-first', JSON.stringify(r.json.data.garages.map((x) => x.name)) === JSON.stringify(['Sparkle Auto Spa', 'Shine Masters', 'Gleam Garage']))

  const DATE = '2026-08-03'
  r = await req('GET', `/garages/${sparkle.g._id}/slots?date=${DATE}&serviceIds=${basic._id}`, { token: tokC })
  ok('slot length = 30', r.json.data.bookingLengthMinutes === 30 && r.json.data.slots.length > 0)

  // concurrency: bays=2, fire 5 for same slot with 5 cars
  const cars = []
  for (let i = 0; i < 5; i++) {
    // eslint-disable-next-line no-await-in-loop
    const c = await req('POST', '/cars', { token: tokC, body: { make: 'T', model: `C${i}`, licensePlate: `REGC-${i}` } })
    cars.push(c.json.data.car._id)
  }
  const results = await Promise.all(cars.map((cid) =>
    req('POST', '/bookings', { token: tokC, body: { garageId: sparkle.g._id, carId: cid, serviceIds: [basic._id], startTime: `${DATE}T12:00:00.000Z` } })
  ))
  const created = results.filter((x) => x.status === 201)
  const rejected = results.filter((x) => x.status === 409)
  log(`concurrency statuses: ${results.map((x) => x.status).join(', ')}`)
  ok('concurrency: exactly 2 created', created.length === 2)
  ok('concurrency: exactly 3 rejected (409)', rejected.length === 3)

  r = await req('GET', `/garages/${sparkle.g._id}/slots?date=${DATE}&serviceIds=${basic._id}`, { token: tokC })
  ok('12:00 slot full (not offered)', !r.json.data.slots.some((s) => s.startTime === `${DATE}T12:00:00.000Z`))
  await req('PATCH', `/bookings/${created[0].json.data.booking._id}/cancel`, { token: tokC })
  r = await req('GET', `/garages/${sparkle.g._id}/slots?date=${DATE}&serviceIds=${basic._id}`, { token: tokC })
  ok('12:00 slot freed after cancel', r.json.data.slots.some((s) => s.startTime === `${DATE}T12:00:00.000Z`))
}
