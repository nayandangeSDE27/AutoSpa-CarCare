import { Router } from 'express'

import validate, { validateQuery } from '../middlewares/validate.js'
import authenticate from '../middlewares/authenticate.js'
import authorize from '../middlewares/authorize.js'
import upload from '../middlewares/upload.js'
import * as garageController from '../controllers/garage.controller.js'
import {
  nearbyQuerySchema,
  slotsQuerySchema,
  createGarageSchema,
  updateGarageSchema,
  gallerySchema,
  documentsSchema,
} from '../validators/garage.validator.js'

const router = Router()

router.use(authenticate)

// ---- Garage-owner profile management ----
router.get('/mine', authorize('garage_owner'), garageController.getMyGarage)
router.post('/', authorize('garage_owner'), validate(createGarageSchema), garageController.createGarage)
router.post('/gallery', authorize('garage_owner'), validate(gallerySchema), garageController.addGallery)
router.post('/gallery/upload', authorize('garage_owner'), upload.array('images', 10), garageController.uploadGallery)
router.post('/documents', authorize('garage_owner'), validate(documentsSchema), garageController.submitDocuments)

// ---- Customer discovery (literal paths before /:id) ----
router.get('/', authorize('customer'), garageController.listGarages)
router.get('/featured', authorize('customer'), garageController.listFeatured)
router.get('/nearby', authorize('customer'), validateQuery(nearbyQuerySchema), garageController.nearby)
router.get('/:id', authorize('customer'), garageController.getGarage)
router.get('/:garageId/slots', authorize('customer'), validateQuery(slotsQuerySchema), garageController.getSlots)

// Owner edits own garage.
router.patch('/:id', authorize('garage_owner'), validate(updateGarageSchema), garageController.updateGarage)

export default router
