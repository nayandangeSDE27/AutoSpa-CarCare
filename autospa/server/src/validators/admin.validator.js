import { z } from 'zod'
import { GARAGE_VERIFICATION_STATUS } from '../models/garage.model.js'
import { USER_ROLES, USER_STATUS } from '../models/user.model.js'
import { BOOKING_STATUS } from '../models/booking.model.js'

const pageLimit = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}

// ---- Garage verification ----
export const adminGaragesQuerySchema = z.object({
  status: z.enum(GARAGE_VERIFICATION_STATUS).optional(),
})

export const rejectGarageSchema = z.object({
  reason: z.string().trim().min(1, 'A rejection reason is required'),
})

// ---- User management ----
export const adminUsersQuerySchema = z.object({
  role: z.enum(USER_ROLES).optional(),
  status: z.enum(USER_STATUS).optional(),
  ...pageLimit,
})

// ---- Booking monitoring ----
export const adminBookingsQuerySchema = z.object({
  status: z.enum(BOOKING_STATUS).optional(),
  garageId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid garageId').optional(),
  customerId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid customerId').optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'from must be YYYY-MM-DD').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'to must be YYYY-MM-DD').optional(),
  ...pageLimit,
})

// ---- Settings ----
export const updateSettingsSchema = z
  .object({
    commissionRate: z.number().min(0).max(1).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Provide at least one setting to update' })
