import { Router } from 'express'

import authRoutes from './auth.routes.js'
import carRoutes from './car.routes.js'
import garageRoutes from './garage.routes.js'
import serviceRoutes from './service.routes.js'
import bookingRoutes from './booking.routes.js'
import workerRoutes from './worker.routes.js'
import dashboardRoutes from './dashboard.routes.js'
import adminRoutes from './admin.routes.js'
import { statsRouter } from './public.routes.js'
import reviewRoutes from './review.routes.js'
import paymentRoutes from './payment.routes.js'
import walletRoutes from './wallet.routes.js'
import notificationRoutes from './notification.routes.js'
import analyticsRoutes from './analytics.routes.js'
import userRoutes from './user.routes.js'
import uploadRoutes from './upload.routes.js'

/**
 * Central API router. Feature routers mount here as later phases add them.
 */
const router = Router()

router.use('/auth', authRoutes)
router.use('/cars', carRoutes)
router.use('/garages', garageRoutes)
router.use('/services', serviceRoutes)
router.use('/bookings', bookingRoutes)
router.use('/workers', workerRoutes)
router.use('/dashboard', dashboardRoutes)
router.use('/admin', adminRoutes)
router.use('/payments', paymentRoutes)
router.use('/wallet', walletRoutes)
router.use('/notifications', notificationRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/users', userRoutes)
router.use('/reviews', reviewRoutes)
router.use('/uploads', uploadRoutes)

// Public, unauthenticated landing-page endpoints.
router.use('/stats', statsRouter)

export default router
