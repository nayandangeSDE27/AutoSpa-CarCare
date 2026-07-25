import { Router } from 'express'

import { validateQuery } from '../middlewares/validate.js'
import authenticate from '../middlewares/authenticate.js'
import * as notificationController from '../controllers/notification.controller.js'
import { paginationQuerySchema } from '../validators/common.validator.js'

const router = Router()

// Any authenticated user manages their own notifications.
router.use(authenticate)

router.get('/', validateQuery(paginationQuerySchema), notificationController.list)
router.patch('/read-all', notificationController.markAllRead) // before /:id
router.patch('/:id/read', notificationController.markRead)
router.delete('/:id', notificationController.remove)

export default router
