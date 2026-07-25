import { Router } from 'express'

import authenticate from '../middlewares/authenticate.js'
import upload from '../middlewares/upload.js'
import { uploadImage } from '../controllers/upload.controller.js'

const router = Router()

// Any authenticated user can upload an image (returns a hosted/mock URL).
router.post('/image', authenticate, upload.single('image'), uploadImage)

export default router
