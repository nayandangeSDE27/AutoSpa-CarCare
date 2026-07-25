import { Router } from 'express'

import * as publicController from '../controllers/public.controller.js'

/**
 * Public, unauthenticated landing-page endpoints. Mounted so they resolve to:
 *   GET /api/stats/public
 *   GET /api/reviews/testimonials
 */
const statsRouter = Router()
statsRouter.get('/public', publicController.publicStats)

const reviewsRouter = Router()
reviewsRouter.get('/testimonials', publicController.testimonials)

export { statsRouter, reviewsRouter }
