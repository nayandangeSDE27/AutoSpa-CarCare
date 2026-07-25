import { Router } from 'express'

import validate from '../middlewares/validate.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'
import * as workerController from '../controllers/worker.controller.js'
import {
  createWorkerSchema,
  updateWorkerSchema,
  workerStatusSchema,
} from '../validators/worker.validator.js'

const router = Router()

// All worker routes are garage-owner only.
router.use(authenticate, authorize('garage_owner'))

router.post('/', validate(createWorkerSchema), workerController.createWorker)
router.get('/', workerController.listWorkers)
router.patch('/:id/status', validate(workerStatusSchema), workerController.setWorkerStatus)
router.patch('/:id', validate(updateWorkerSchema), workerController.updateWorker)
router.delete('/:id', workerController.deleteWorker)

export default router
