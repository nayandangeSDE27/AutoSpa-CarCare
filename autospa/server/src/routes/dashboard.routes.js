import { Router } from 'express'

import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'
import * as dashboardController from '../controllers/dashboard.controller.js'

const router = Router()

router.get('/garage', authenticate, authorize('garage_owner'), dashboardController.garageDashboard)
router.get('/admin', authenticate, authorize('admin'), dashboardController.adminDashboard)
router.get('/customer', authenticate, authorize('customer'), dashboardController.customerDashboard)

export default router
