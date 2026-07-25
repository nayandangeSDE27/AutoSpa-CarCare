import { z } from 'zod'
import { BOOKING_STATUS } from '../models/booking.model.js'

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

export const createBookingSchema = z.object({
  garageId: objectId,
  carId: objectId,
  serviceIds: z.array(objectId).min(1, 'Select at least one service'),
  startTime: z.string().datetime('startTime must be an ISO 8601 datetime'),
})

export const createWalkInBookingSchema = z.object({
  customerName: z.string().trim().min(1, 'Customer name is required'),
  customerPhone: z.string().trim().max(20).optional().or(z.literal('')),
  vehicleRegistrationNumber: z.string().trim().min(1, 'Vehicle registration number is required'),
  vehicleBrand: z.string().trim().optional().or(z.literal('')),
  vehicleModel: z.string().trim().optional().or(z.literal('')),
  vehicleType: z.string().trim().optional().or(z.literal('')),
  serviceIds: z.array(objectId).min(1, 'Select at least one service'),
  bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Booking date must be in YYYY-MM-DD format'),
  estimatedStartTime: z.string().regex(/^\d{2}:\d{2}$/, 'Estimated start time must be in HH:MM format'),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
})

export const rescheduleBookingSchema = z.object({
  startTime: z.string().datetime('startTime must be an ISO 8601 datetime'),
})

// ----- Garage-owner booking management -----
export const updateStatusSchema = z.object({
  status: z.enum(BOOKING_STATUS),
})

export const assignWorkerSchema = z.object({
  workerId: objectId,
})

export const startServiceSchema = z.object({
  // otp is required for ONLINE bookings only; the service layer enforces this.
  // WALK_IN bookings send no OTP so we must not require it at the schema level.
  otp: z.string().optional(),
  beforeImages: z.array(z.string()).optional(),
})

export const completeServiceSchema = z.object({
  afterImages: z.array(z.string().url()).optional(),
})
