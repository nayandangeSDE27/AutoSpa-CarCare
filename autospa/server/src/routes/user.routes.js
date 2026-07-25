import { Router } from 'express'

import validate from '../middlewares/validate.js'
import authenticate from '../middlewares/authenticate.js'
import * as userController from '../controllers/user.controller.js'
import { updateMeSchema, changePasswordSchema } from '../validators/user.validator.js'

const router = Router()

router.use(authenticate)

router.get('/me', userController.getMe)
router.patch('/me', validate(updateMeSchema), userController.updateMe)
router.post('/me/change-password', validate(changePasswordSchema), userController.changePassword)

export default router
