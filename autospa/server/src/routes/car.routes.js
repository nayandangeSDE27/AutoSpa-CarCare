import { Router } from 'express'

import validate from '../middlewares/validate.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'
import * as carController from '../controllers/car.controller.js'
import { createCarSchema, updateCarSchema } from '../validators/car.validator.js'

const router = Router()

// Every car route requires an authenticated customer.
router.use(authenticate, authorize('customer'))

router.post('/', validate(createCarSchema), carController.createCar)
router.get('/', carController.listCars)
router.get('/:id', carController.getCar)
router.patch('/:id', validate(updateCarSchema), carController.updateCar)
router.delete('/:id', carController.deleteCar)

export default router
