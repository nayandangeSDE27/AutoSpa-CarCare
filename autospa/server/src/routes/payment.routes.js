import { Router } from 'express'

import validate, { validateQuery } from '../middlewares/validate.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'
import * as paymentController from '../controllers/payment.controller.js'
import { createOrderSchema } from '../validators/payment.validator.js'
import { paginationQuerySchema } from '../validators/common.validator.js'

const router = Router()

// NOTE: POST /webhook is mounted separately in app.js (raw body, no auth).

router.post('/create-order', authenticate, authorize('customer'), validate(createOrderSchema), paymentController.createOrder)
router.get('/history', authenticate, validateQuery(paginationQuerySchema), paymentController.history)
router.get('/:id', authenticate, paymentController.getPayment)

export default router
