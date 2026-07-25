import { Router } from 'express'

import validate from '../middlewares/validate.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'
import * as bookingController from '../controllers/booking.controller.js'
import {
  createBookingSchema,
  createWalkInBookingSchema,
  rescheduleBookingSchema,
  updateStatusSchema,
  assignWorkerSchema,
  startServiceSchema,
  completeServiceSchema,
} from '../validators/booking.validator.js'

const router = Router()

router.use(authenticate)

// ---- Shared reads (role-branched in the controller) ----
router.get('/', authorize('customer', 'garage_owner'), bookingController.listBookings)
router.get('/upcoming', authorize('customer'), bookingController.listUpcoming) // before /:id
router.get('/:id', authorize('customer', 'garage_owner'), bookingController.getBooking)
router.get('/:id/invoice', authorize('customer', 'garage_owner'), bookingController.downloadInvoice)

// ---- Garage-owner walk-in bookings ----
router.post('/garage/walkin-bookings', authorize('garage_owner'), validate(createWalkInBookingSchema), bookingController.createWalkInBooking)
router.get('/garage/walkin-bookings', authorize('garage_owner'), bookingController.listGarageWalkInBookings)

// ---- Customer actions ----
router.post('/', authorize('customer'), validate(createBookingSchema), bookingController.createBooking)
router.patch('/:id/cancel', authorize('customer'), bookingController.cancelBooking)
router.patch('/:id/reschedule', authorize('customer'), validate(rescheduleBookingSchema), bookingController.rescheduleBooking)

// ---- Garage-owner booking management (state machine) ----
router.patch('/:id/status', authorize('garage_owner'), validate(updateStatusSchema), bookingController.updateStatus)
router.patch('/:id/assign-worker', authorize('garage_owner'), validate(assignWorkerSchema), bookingController.assignWorker)
router.patch('/:id/start', authorize('garage_owner'), validate(startServiceSchema), bookingController.startService)
router.patch('/:id/complete', authorize('garage_owner'), validate(completeServiceSchema), bookingController.completeService)

export default router
