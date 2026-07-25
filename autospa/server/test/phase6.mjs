/**
 * Phase 6 suite: payments/webhook idempotency, wallet ledger, socket events,
 * cron functions, invoice PDF, analytics. In-memory Mongo + mock Redis; Stripe
 * is exercised at the SERVICE layer with a synthetic event (no network).
 */
import { io as ioClient } from 'socket.io-client'

import User from '../src/models/user.model.js'
import Garage from '../src/models/garage.model.js'
import Service from '../src/models/service.model.js'
import Worker from '../src/models/worker.model.js'
import Car from '../src/models/car.model.js'
import Booking from '../src/models/booking.model.js'
import Payment from '../src/models/payment.model.js'

import paymentService from '../src/services/payment.service.js'
import bookingService from '../src/services/booking.service.js'
import walletService from '../src/services/wallet.service.js'
import mailer from '../src/utils/mailer.js'
import jobs from '../src/jobs/index.js'
import bookingRepository from '../src/repositories/booking.repository.js'
import walletRepository from '../src/repositories/wallet.repository.js'
import { signRefreshToken } from '../src/utils/jwt.js'

const point = (lng, lat) => ({ type: 'Point', coordinates: [lng, lat] })

export async function runPhase6(ctx) {
  const { req, redis, realtime, ok, section, log } = ctx
  const login = async (email) => (await req('POST', '/auth/login', { body: { email, password: 'Passw0rd!' } })).json.data.accessToken
  const sink = () => realtime.getTestSink()
  const emitted = (event, userId) => sink().some((e) => e.event === event && (!userId || e.userId === String(userId)))

  section('SEED — owner+approved garage+service+worker, customer+car, one COMPLETED unpaid booking')
  const owner = await User.create({ name: 'Owner', email: 'ow6@example.com', phone: '+1', password: 'Passw0rd!', role: 'garage_owner', isEmailVerified: true })
  const customer = await User.create({ name: 'Cust', email: 'cu6@example.com', phone: '+2', password: 'Passw0rd!', role: 'customer', isEmailVerified: true })
  await User.create({ name: 'Admin', email: 'ad6@example.com', phone: '+3', password: 'Passw0rd!', role: 'admin', isEmailVerified: true })
  const allWeekOpen = Array.from({ length: 7 }, (_, day) => ({ day, open: '00:00', close: '23:59', isClosed: false }))
  const garage = await Garage.create({ name: 'Pay Garage', owner: owner._id, location: point(77.5946, 12.9716), serviceBays: 1, workingHours: allWeekOpen, slotDurationMinutes: 30, verificationStatus: 'APPROVED' })
  const service = await Service.create({ garageId: garage._id, name: 'Basic Wash', price: 100, durationMinutes: 30 })
  const worker = await Worker.create({ garageId: garage._id, name: 'Worker A' })
  const car = await Car.create({ owner: customer._id, make: 'Toyota', model: 'Yaris', licensePlate: 'PH6-1' })

  const snap = [{ serviceId: service._id, nameAtBooking: 'Basic Wash', priceAtBooking: 100, durationAtBooking: 30 }]
  const completed = await Booking.create({
    bookingNumber: 'ASP-PAY-0001', customerId: customer._id, carId: car._id, garageId: garage._id, services: snap,
    bookingDate: new Date('2026-08-03T00:00:00.000Z'), startTime: new Date('2026-08-03T10:00:00.000Z'), endTime: new Date('2026-08-03T10:30:00.000Z'),
    status: 'COMPLETED', paymentStatus: 'PENDING', totalAmount: 100,
  })
  const payment = await Payment.create({ bookingId: completed._id, customerId: customer._id, garageId: garage._id, amount: 100, currency: 'usd', stripePaymentIntentId: 'pi_test_1', status: 'PENDING' })

  const tOwner = await login('ow6@example.com')
  const tCust = await login('cu6@example.com')
  const tAdmin = await login('ad6@example.com')

  // ---------------- PAYMENT WEBHOOK + IDEMPOTENCY ----------------
  section('PAYMENTS — webhook marks PAID, commission, wallet credit; idempotent on replay')
  realtime.clearTestSink()
  const event = { id: 'evt_1', type: 'payment_intent.succeeded', data: { object: { id: 'pi_test_1' } } }
  const first = await paymentService.handleStripeEvent(event)
  ok('webhook handled (not idempotent first time)', first.handled === true && first.idempotent === false)

  const paidPayment = await Payment.findById(payment._id)
  const paidBooking = await Booking.findById(completed._id)
  ok('payment -> PAID', paidPayment.status === 'PAID')
  ok('booking paymentStatus -> PAID', paidBooking.paymentStatus === 'PAID')
  ok('commission = 100 * 0.10 = 10', paidPayment.commission === 10)
  ok('garageEarnings = 90', paidPayment.garageEarnings === 90)

  let wallet = await walletRepository.getByGarage(garage._id)
  let txs = await walletRepository.listTransactions(garage._id)
  console.log(`  wallet balance=${wallet.balance}, tx count=${txs.total}, last balanceAfter=${txs.items[0]?.balanceAfterTransaction}`)
  ok('wallet credited 90', wallet.balance === 90)
  ok('one CREDIT tx with balanceAfterTransaction 90', txs.total === 1 && txs.items[0].type === 'CREDIT' && txs.items[0].balanceAfterTransaction === 90)
  ok('paymentReceived emitted to owner', emitted('paymentReceived', owner._id))
  ok('walletUpdated emitted to owner', emitted('walletUpdated', owner._id))

  // Replay the SAME event
  const second = await paymentService.handleStripeEvent(event)
  wallet = await walletRepository.getByGarage(garage._id)
  txs = await walletRepository.listTransactions(garage._id)
  console.log(`  after replay: idempotent=${second.idempotent}, balance=${wallet.balance}, tx count=${txs.total}`)
  ok('replay is idempotent', second.idempotent === true)
  ok('NO double credit (balance still 90)', wallet.balance === 90)
  ok('NO extra tx (still 1)', txs.total === 1)

  // ---------------- WALLET LEDGER ----------------
  section('WALLET — ledger balances across transactions')
  await walletService.topUp(owner._id, 50) // 90 -> 140
  await walletService.topUp(owner._id, 10) // 140 -> 150
  const w = await walletService.getWallet(owner._id)
  const ledger = await walletService.listTransactions(owner._id, { page: 1, limit: 10 })
  const balances = ledger.items.map((t) => t.balanceAfterTransaction).reverse() // oldest first
  console.log(`  balance=${w.balance}, ledger balances (oldest→newest)=${JSON.stringify(balances)}`)
  ok('final balance = 150', w.balance === 150)
  ok('ledger chains correctly [90,140,150]', JSON.stringify(balances) === JSON.stringify([90, 140, 150]))

  // ---------------- SOCKET EVENTS ON LIFECYCLE ----------------
  section('REALTIME — service layer emits events across the booking lifecycle')
  realtime.clearTestSink()
  const nb = await bookingService.createBooking(customer._id, { garageId: garage._id, carId: car._id, serviceIds: [service._id], startTime: '2026-09-01T09:00:00.000Z' })
  ok('newBooking emitted to owner on create', emitted('newBooking', owner._id))
  await bookingService.updateBookingStatus(nb._id, owner._id, 'ACCEPTED')
  ok('bookingAccepted emitted to customer', emitted('bookingAccepted', customer._id))
  const otp = (await bookingRepository.findById(nb._id)).serviceOtp
  await bookingService.assignWorker(nb._id, owner._id, String(worker._id))
  ok('workerAssigned emitted to customer', emitted('workerAssigned', customer._id))
  await bookingService.startService(nb._id, owner._id, otp)
  ok('bookingStarted emitted to customer', emitted('bookingStarted', customer._id))
  await bookingService.completeService(nb._id, owner._id, [])
  ok('bookingCompleted emitted to customer', emitted('bookingCompleted', customer._id))

  // live socket auth (valid connects, invalid rejected)
  const connect = (token) =>
    new Promise((resolve) => {
      const s = ioClient('http://localhost:5100', { auth: { token }, transports: ['websocket'], reconnection: false, timeout: 3000 })
      s.on('connect', () => { s.close(); resolve('connected') })
      s.on('connect_error', (e) => { s.close(); resolve(`error:${e.message}`) })
    })
  ok('socket connects with valid JWT', (await connect(tCust)) === 'connected')
  ok('socket rejected with invalid JWT', (await connect('garbage')).startsWith('error'))

  // ---------------- NOTIFICATIONS API ----------------
  section('NOTIFICATIONS — persisted rows + read/delete endpoints')
  let r = await req('GET', '/notifications', { token: tCust })
  console.log(`  customer notifications: total=${r.json.data.total}, unread=${r.json.data.unread}`)
  ok('customer has notifications from lifecycle', r.status === 200 && r.json.data.total >= 4)
  const firstN = r.json.data.items[0]._id
  r = await req('PATCH', `/notifications/${firstN}/read`, { token: tCust })
  ok('mark one read', r.status === 200 && r.json.data.notification.isRead === true)
  r = await req('PATCH', '/notifications/read-all', { token: tCust })
  ok('mark all read', r.status === 200)
  r = await req('GET', '/notifications', { token: tCust })
  ok('unread now 0', r.json.data.unread === 0)
  r = await req('DELETE', `/notifications/${firstN}`, { token: tCust })
  ok('delete notification', r.status === 200)

  // ---------------- CRON FUNCTIONS (called directly) ----------------
  section('CRON — each job function invoked directly')
  // reminders: a booking starting in ~2h
  const soon = new Date(Date.now() + 2 * 60 * 60 * 1000)
  await Booking.create({ bookingNumber: 'ASP-REM-1', customerId: customer._id, carId: car._id, garageId: garage._id, services: snap, bookingDate: new Date(soon.toISOString().slice(0, 10)), startTime: soon, endTime: new Date(soon.getTime() + 30 * 60000), status: 'ACCEPTED', totalAmount: 100 })
  const remind1 = await jobs.sendBookingReminders()
  const remind2 = await jobs.sendBookingReminders()
  ok('sendBookingReminders sends once then is idempotent', remind1 >= 1 && remind2 === 0)

  const snapshot = await jobs.dailyAnalyticsRollup()
  ok('dailyAnalyticsRollup writes a snapshot', !!snapshot && typeof snapshot.totalBookings === 'number')
  ok('dailyAnalyticsRollup notifies admins (newReport)', emitted('newReport'))

  // clean refresh tokens: one valid, one garbage
  await redis.set('auth:refresh:valid', signRefreshToken({ userId: String(customer._id), role: 'customer' }))
  await redis.set('auth:refresh:bad', 'not-a-jwt')
  const removed = await jobs.cleanExpiredRefreshTokens()
  const validStill = await redis.get('auth:refresh:valid')
  const badGone = await redis.get('auth:refresh:bad')
  console.log(`  cleanExpiredRefreshTokens removed=${removed}`)
  ok('removes invalid refresh token, keeps valid', removed >= 1 && !!validStill && badGone === null)

  const follow1 = await jobs.sendCompletionFollowUps()
  const follow2 = await jobs.sendCompletionFollowUps()
  ok('sendCompletionFollowUps sends once then idempotent', follow1 >= 1 && follow2 === 0)

  // ---------------- INVOICE PDF ----------------
  section('INVOICE — PDF generates for a PAID booking')
  const inv = await fetch(`${ctx.baseUrl}/bookings/${completed._id}/invoice`, { headers: { Authorization: `Bearer ${tOwner}` } })
  const buf = Buffer.from(await inv.arrayBuffer())
  console.log(`  invoice: status=${inv.status}, type=${inv.headers.get('content-type')}, bytes=${buf.length}`)
  ok('invoice 200 + application/pdf', inv.status === 200 && inv.headers.get('content-type') === 'application/pdf')
  ok('invoice body is a real PDF (%PDF header)', buf.length > 500 && buf.slice(0, 4).toString() === '%PDF')

  const invUnpaid = await fetch(`${ctx.baseUrl}/bookings/${nb._id}/invoice`, { headers: { Authorization: `Bearer ${tOwner}` } })
  ok('invoice rejected for unpaid booking (400)', invUnpaid.status === 400)

  // ---------------- ANALYTICS ----------------
  section('ANALYTICS — aggregation pipelines return correct shapes')
  r = await req('GET', '/analytics/garage', { token: tOwner })
  console.log('  garage analytics:', JSON.stringify(r.json.data))
  ok('garage analytics shapes', r.status === 200 && Array.isArray(r.json.data.revenueOverTime) && Array.isArray(r.json.data.bookingsByStatus) && Array.isArray(r.json.data.topServices))
  ok('garage revenueOverTime reflects the paid 100', r.json.data.revenueOverTime.reduce((s, d) => s + d.revenue, 0) === 100)
  ok('garage topServices includes Basic Wash', r.json.data.topServices.some((t) => t.service === 'Basic Wash'))

  r = await req('GET', '/analytics/admin', { token: tAdmin })
  console.log('  admin analytics keys:', Object.keys(r.json.data).join(', '))
  ok('admin analytics shapes', r.status === 200 && Array.isArray(r.json.data.revenueOverTime) && Array.isArray(r.json.data.garagesByStatus) && Array.isArray(r.json.data.bookingsTrend))
  ok('admin revenueOverTime includes commission', r.json.data.revenueOverTime.reduce((s, d) => s + d.commission, 0) === 10)

  // ---------------- MAILER MOCK FALLBACK ----------------
  section('MAILER — mock fallback works with no SMTP configured')
  const mres = await mailer.send({ to: 'x@example.com', subject: 'Hi', text: 'test' })
  ok('mailer mock returns mocked=true', mres.mocked === true)
}
