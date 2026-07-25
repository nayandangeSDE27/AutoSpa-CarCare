import PDFDocument from 'pdfkit'

import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import bookingService from '../services/booking.service.js'
import invoiceService from '../services/invoice.service.js'
import { renderInvoice } from '../utils/invoicePdf.js'

export const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(req.user.id, req.body)
  successResponse(res, { statusCode: 201, message: 'Booking created', data: { booking } })
})

export const createWalkInBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createWalkInBooking(req.user.id, req.body)
  successResponse(res, { statusCode: 201, message: 'Walk-in booking created', data: { booking } })
})

export const listBookings = asyncHandler(async (req, res) => {
  // Branch by role: garage owners see THEIR garage's bookings.
  const bookings =
    req.user.role === 'garage_owner'
      ? await bookingService.listGarageBookings(req.user.id)
      : await bookingService.listBookings(req.user.id)
  successResponse(res, { message: 'Bookings', data: { bookings } })
})

export const listUpcoming = asyncHandler(async (req, res) => {
  const bookings = await bookingService.listUpcoming(req.user.id)
  successResponse(res, { message: 'Upcoming bookings', data: { bookings } })
})

export const listGarageWalkInBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.listGarageWalkInBookings(req.user.id)
  successResponse(res, { message: 'Walk-in bookings', data: { bookings } })
})

export const getBooking = asyncHandler(async (req, res) => {
  const booking =
    req.user.role === 'garage_owner'
      ? await bookingService.getGarageBooking(req.params.id, req.user.id)
      : await bookingService.getBooking(req.params.id, req.user.id)
  successResponse(res, { message: 'Booking', data: { booking } })
})

export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelBooking(req.params.id, req.user.id)
  successResponse(res, { message: 'Booking cancelled', data: { booking } })
})

export const rescheduleBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.rescheduleBooking(req.params.id, req.user.id, req.body)
  successResponse(res, { message: 'Booking rescheduled', data: { booking } })
})

// ----- Garage-owner booking management -----

export const updateStatus = asyncHandler(async (req, res) => {
  const booking = await bookingService.updateBookingStatus(req.params.id, req.user.id, req.body.status)
  successResponse(res, { message: `Booking ${booking.status}`, data: { booking } })
})

export const assignWorker = asyncHandler(async (req, res) => {
  const booking = await bookingService.assignWorker(req.params.id, req.user.id, req.body.workerId)
  successResponse(res, { message: 'Worker assigned', data: { booking } })
})

export const startService = asyncHandler(async (req, res) => {
  const booking = await bookingService.startService(req.params.id, req.user.id, req.body.otp, req.body.beforeImages)
  successResponse(res, { message: 'Service started', data: { booking } })
})

export const completeService = asyncHandler(async (req, res) => {
  const booking = await bookingService.completeService(req.params.id, req.user.id, req.body.afterImages)
  successResponse(res, { message: 'Service completed', data: { booking } })
})

// ----- Invoice PDF (paid bookings) -----
export const downloadInvoice = asyncHandler(async (req, res) => {
  const data = await invoiceService.getInvoiceData(req.params.id, req.user)
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="invoice-${data.booking.bookingNumber}.pdf"`)
  const doc = new PDFDocument({ margin: 50 })
  doc.pipe(res)
  renderInvoice(doc, data)
  doc.end()
})
