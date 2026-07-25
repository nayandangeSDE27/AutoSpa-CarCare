import { Router } from 'express'

import validate, { validateQuery } from '../middlewares/validate.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'
import * as walletController from '../controllers/wallet.controller.js'
import { paginationQuerySchema } from '../validators/common.validator.js'
import { topUpSchema } from '../validators/wallet.validator.js'

const router = Router()

// Wallet belongs to a garage owner.
router.use(authenticate, authorize('garage_owner'))

router.get('/', walletController.getWallet)
router.get('/transactions', validateQuery(paginationQuerySchema), walletController.getTransactions)
router.post('/topup', validate(topUpSchema), walletController.topUp)

export default router
