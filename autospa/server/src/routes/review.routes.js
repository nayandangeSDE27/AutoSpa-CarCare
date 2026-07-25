import { Router } from 'express'

import validate from '../middlewares/validate.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'
import * as reviewController from '../controllers/review.controller.js'
import { createReviewSchema, updateReviewSchema, replyReviewSchema } from '../validators/review.validator.js'

const router = Router()

// --- Public ---
router.get('/testimonials', reviewController.testimonials)
router.get('/garage/:garageId', reviewController.listByGarage)

// --- Customer ---
router.get('/mine', authenticate, authorize('customer'), reviewController.listMine)
router.get('/pending', authenticate, authorize('customer'), reviewController.listPending)
router.post('/', authenticate, authorize('customer'), validate(createReviewSchema), reviewController.createReview)
router.patch('/:id', authenticate, authorize('customer'), validate(updateReviewSchema), reviewController.updateReview)
router.delete('/:id', authenticate, authorize('customer'), reviewController.deleteReview)

// --- Garage owner reply ---
router.patch('/:id/reply', authenticate, authorize('garage_owner'), validate(replyReviewSchema), reviewController.replyToReview)

export default router
