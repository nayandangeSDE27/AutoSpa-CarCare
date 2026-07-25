import { Router } from 'express'

import validate, { validateQuery } from '../middlewares/validate.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'
import * as serviceController from '../controllers/service.controller.js'
import { servicesQuerySchema } from '../validators/garage.validator.js'
import { createServiceSchema, updateServiceSchema } from '../validators/service.validator.js'

const router = Router()

router.use(authenticate)

// ---- Customer discovery ----
router.get('/popular', authorize('customer'), serviceController.listPopular) // before query route
router.get('/', authorize('customer'), validateQuery(servicesQuerySchema), serviceController.listByGarage)

// ---- Garage-owner catalogue management ----
router.get('/mine', authorize('garage_owner'), serviceController.listMine)
router.post('/', authorize('garage_owner'), validate(createServiceSchema), serviceController.createService)
router.patch('/:id', authorize('garage_owner'), validate(updateServiceSchema), serviceController.updateService)
router.delete('/:id', authorize('garage_owner'), serviceController.deleteService)

export default router
