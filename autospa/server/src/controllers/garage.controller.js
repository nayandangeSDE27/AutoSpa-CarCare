import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import garageService from '../services/garage.service.js'
import slotService from '../services/slot.service.js'

export const listGarages = asyncHandler(async (req, res) => {
  const garages = await garageService.listGarages()
  successResponse(res, { message: 'Approved garages', data: { garages } })
})

export const listFeatured = asyncHandler(async (req, res) => {
  const garages = await garageService.listFeatured()
  successResponse(res, { message: 'Featured garages', data: { garages } })
})

export const nearby = asyncHandler(async (req, res) => {
  const garages = await garageService.findNearby(req.validatedQuery)
  successResponse(res, {
    message: 'Nearby garages',
    data: { garages },
  })
})

export const getGarage = asyncHandler(async (req, res) => {
  const garage = await garageService.getGarage(req.params.id)
  successResponse(res, { message: 'Garage', data: { garage } })
})

export const getSlots = asyncHandler(async (req, res) => {
  const result = await slotService.getAvailableSlots({
    garageId: req.params.garageId,
    date: req.validatedQuery.date,
    serviceIds: req.validatedQuery.serviceIds,
  })
  successResponse(res, { message: 'Available slots', data: result })
})

// ----- Garage-owner profile management -----

export const getMyGarage = asyncHandler(async (req, res) => {
  const garage = await garageService.getOwnerGarage(req.user.id)
  successResponse(res, { message: 'Your garage', data: { garage } })
})

export const createGarage = asyncHandler(async (req, res) => {
  const garage = await garageService.createOwnGarage(req.user.id, req.body)
  successResponse(res, { statusCode: 201, message: 'Garage created (pending verification)', data: { garage } })
})

export const updateGarage = asyncHandler(async (req, res) => {
  const garage = await garageService.updateOwnGarage(req.params.id, req.user.id, req.body)
  successResponse(res, { message: 'Garage updated', data: { garage } })
})

export const addGallery = asyncHandler(async (req, res) => {
  const garage = await garageService.addGalleryImages(req.user.id, req.body.images)
  successResponse(res, { message: 'Gallery images added', data: { garage } })
})

export const uploadGallery = asyncHandler(async (req, res) => {
  const garage = await garageService.uploadGalleryImages(req.user.id, req.files)
  successResponse(res, { message: 'Gallery images uploaded', data: { garage } })
})

export const submitDocuments = asyncHandler(async (req, res) => {
  const doc = await garageService.submitDocuments(req.user.id, req.body.documents)
  successResponse(res, { statusCode: 201, message: 'Documents submitted for verification', data: { document: doc } })
})
