import { Router } from 'express'

import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'
import * as analyticsController from '../controllers/analytics.controller.js'

const router = Router()

router.get('/garage', authenticate, authorize('garage_owner'), analyticsController.garageAnalytics)
router.get('/admin', authenticate, authorize('admin'), analyticsController.adminAnalytics)

export default router
