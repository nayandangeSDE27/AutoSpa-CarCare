import mongoose from 'mongoose'

import ApiError from '../utils/ApiError.js'
import logger from '../utils/logger.js'
import stripe from '../config/stripe.js'
import config from '../config/index.js'
import paymentRepository from '../repositories/payment.repository.js'
import bookingRepository from '../repositories/booking.repository.js'
import garageRepository from '../repositories/garage.repository.js'
import walletService from './wallet.service.js'
import settingsService from './settings.service.js'
import notificationService from './notification.service.js'

/**
 * paymentService — Stripe payments (pay AFTER completion) + the webhook that is
 * the single source of truth for marking a booking PAID.
 */

const round2 = (n) => Math.round(n * 100) / 100

// ---- create-order: payment options for a COMPLETED, unpaid booking ----
async function createOrder(customerId, bookingId, paymentMethod = 'card') {
  const booking = await bookingRepository.findById(bookingId)
  if (!booking || booking.customerId.toString() !== customerId.toString()) {
    throw new ApiError(404, 'Booking not found')
  }
  if (booking.status !== 'COMPLETED') {
    throw new ApiError(400, 'Payment is only available after the booking is completed')
  }
  if (booking.paymentStatus === 'PAID') {
    throw new ApiError(400, 'Booking is already paid')
  }
  const normalizedMethod = ['upi', 'card', 'cash'].includes(paymentMethod) ? paymentMethod : 'card'

  if (normalizedMethod === 'cash') {
    const payment = await paymentRepository.create({
      bookingId: booking._id,
      customerId,
      garageId: booking.garageId,
      amount: booking.totalAmount,
      currency: config.stripe.currency,
      paymentMethod: 'cash',
      status: 'PAID',
    })

    await bookingRepository.updateById(booking._id, { paymentStatus: 'PAID' })

    return {
      paymentId: payment.id,
      paymentStatus: 'PAID',
      paymentMethod: 'cash',
      message: 'Cash selected. The booking is marked as paid.',
    }
  }

  if (!stripe) {
    const payment = await paymentRepository.create({
      bookingId: booking._id,
      customerId,
      garageId: booking.garageId,
      amount: booking.totalAmount,
      currency: config.stripe.currency,
      paymentMethod: normalizedMethod,
      status: 'PAID',
    })

    await bookingRepository.updateById(booking._id, { paymentStatus: 'PAID' })

    return {
      paymentId: payment.id,
      paymentStatus: 'PAID',
      paymentMethod: normalizedMethod,
      message: 'Payment completed locally. Stripe is not configured in this environment.',
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: normalizedMethod === 'upi' ? ['upi'] : ['card'],
    line_items: [
      {
        price_data: {
          currency: config.stripe.currency,
          unit_amount: Math.round(booking.totalAmount * 100),
          product_data: {
            name: `AutoSpa service - ${booking.bookingNumber}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId: booking.id, customerId: String(customerId), paymentMethod: normalizedMethod },
    success_url: `${config.clientUrl}/customer/bookings?payment=success`,
    cancel_url: `${config.clientUrl}/customer/bookings?payment=cancelled`,
  })

  const payment = await paymentRepository.create({
    bookingId: booking._id,
    customerId,
    garageId: booking.garageId,
    amount: booking.totalAmount,
    currency: config.stripe.currency,
    paymentMethod: normalizedMethod,
    stripePaymentIntentId: session.payment_intent || session.id || '',
    clientSecret: session.client_secret || '',
    status: 'PENDING',
  })

  return { checkoutUrl: session.url, paymentId: payment.id, paymentStatus: payment.status, paymentMethod: normalizedMethod }
}

// ---- webhook: verify signature then hand the event to the service ----
function constructEvent(rawBody, signature) {
  if (!stripe) throw new ApiError(503, 'Payments are not configured')
  return stripe.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret)
}

/**
 * Process a Stripe event. Idempotent: the same event twice never double-credits.
 * Returns { handled, idempotent }.
 */
async function handleStripeEvent(event) {
  if (event.type !== 'payment_intent.succeeded') {
    return { handled: false }
  }
  const intent = event.data.object
  return markPaid(intent.id, event.id)
}

async function markPaid(paymentIntentId, eventId) {
  let outcome = { handled: true, idempotent: false }
  let notifyPayload = null

  const session = await mongoose.startSession()
  try {
    await session.withTransaction(async () => {
      const payment = await paymentRepository.findByPaymentIntentId(paymentIntentId, session)
      if (!payment) {
        outcome = { handled: false, reason: 'payment_not_found' }
        return
      }
      // Idempotency guard — already processed.
      if (payment.status === 'PAID') {
        outcome = { handled: true, idempotent: true }
        return
      }

      const booking = await bookingRepository.findById(payment.bookingId).session(session)
      const settings = await settingsService.getSettings()
      const commission = round2(payment.amount * settings.commissionRate)
      const garageEarnings = round2(payment.amount - commission)

      await paymentRepository.updateById(
        payment._id,
        { status: 'PAID', commission, garageEarnings, processedEventId: eventId || '' },
        session
      )
      await bookingRepository.updateById(booking._id, { paymentStatus: 'PAID' }, session)

      await walletService.creditEarnings(
        payment.garageId,
        garageEarnings,
        { relatedType: 'Payment', relatedId: payment._id, description: `Earnings for booking ${booking.bookingNumber}` },
        session
      )

      notifyPayload = { garageId: payment.garageId, bookingId: booking._id, bookingNumber: booking.bookingNumber, amount: payment.amount, garageEarnings }
    })
  } finally {
    await session.endSession()
  }

  // Side effects (notifications/socket) after the transaction commits.
  if (notifyPayload && !outcome.idempotent) {
    const garage = await garageRepository.findById(notifyPayload.garageId)
    if (garage?.owner) {
      await notificationService.notify(garage.owner, {
        event: 'paymentReceived',
        title: 'Payment received',
        message: `Payment of ${notifyPayload.amount} received for booking ${notifyPayload.bookingNumber}.`,
        relatedType: 'Booking',
        relatedId: notifyPayload.bookingId,
        data: { garageEarnings: notifyPayload.garageEarnings },
      })
      await notificationService.notify(garage.owner, {
        event: 'walletUpdated',
        title: 'Wallet credited',
        message: `Your wallet was credited ${notifyPayload.garageEarnings}.`,
        relatedType: 'Wallet',
        data: { credited: notifyPayload.garageEarnings },
      })
    }
    logger.info(`[payment] booking ${notifyPayload.bookingNumber} marked PAID; garage credited ${notifyPayload.garageEarnings}`)
  }

  return outcome
}

// ---- history / detail ----
async function getHistory(user, pagination) {
  if (user.role === 'garage_owner') {
    const garage = await garageRepository.findByOwner(user.id)
    if (!garage) return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 }
    return paymentRepository.findPaginated({ garageId: garage._id }, pagination)
  }
  return paymentRepository.findPaginated({ customerId: user.id }, pagination)
}

async function getPayment(id, user) {
  const payment = await paymentRepository.findById(id)
  if (!payment) throw new ApiError(404, 'Payment not found')
  if (user.role === 'garage_owner') {
    const garage = await garageRepository.findByOwner(user.id)
    if (!garage || payment.garageId.toString() !== garage._id.toString()) {
      throw new ApiError(404, 'Payment not found')
    }
  } else if (payment.customerId.toString() !== user.id.toString()) {
    throw new ApiError(404, 'Payment not found')
  }
  return payment
}

export default { createOrder, constructEvent, handleStripeEvent, markPaid, getHistory, getPayment }
