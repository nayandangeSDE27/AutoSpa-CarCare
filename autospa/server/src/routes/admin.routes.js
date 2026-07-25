import { Router } from 'express'

import validate, { validateQuery } from '../middlewares/validate.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'
import * as adminController from '../controllers/admin.controller.js'
import {
  adminGaragesQuerySchema,
  rejectGarageSchema,
  adminUsersQuerySchema,
  adminBookingsQuerySchema,
  updateSettingsSchema,
} from '../validators/admin.validator.js'

const router = Router()

// Every admin route requires an authenticated admin.
router.use(authenticate, authorize('admin'))

// ---- Garage verification ----
router.get('/garages', validateQuery(adminGaragesQuerySchema), adminController.listGarages)
router.patch('/garages/:id/approve', adminController.approveGarage)
router.patch('/garages/:id/reject', validate(rejectGarageSchema), adminController.rejectGarage)
router.patch('/garages/:id/suspend', adminController.suspendGarage)

// ---- User management ----
router.get('/users', validateQuery(adminUsersQuerySchema), adminController.listUsers)
router.patch('/users/:id/block', adminController.blockUser)
router.patch('/users/:id/unblock', adminController.unblockUser)

// ---- Booking monitoring (read-only) ----
router.get('/bookings', validateQuery(adminBookingsQuerySchema), adminController.listBookings)

// ---- Reports + settings ----
router.get('/reports', adminController.getReports)
router.get('/settings', adminController.getSettings)
router.patch('/settings', validate(updateSettingsSchema), adminController.updateSettings)

export default router
