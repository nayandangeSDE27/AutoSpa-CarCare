import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import serviceService from '../services/service.service.js'

export const listByGarage = asyncHandler(async (req, res) => {
  const services = await serviceService.listByGarage(req.validatedQuery.garageId)
  successResponse(res, { message: 'Garage services', data: { services } })
})

export const listPopular = asyncHandler(async (req, res) => {
  const services = await serviceService.listPopular()
  successResponse(res, { message: 'Popular services', data: { services } })
})

// ----- Garage-owner catalogue management -----

export const listMine = asyncHandler(async (req, res) => {
  const services = await serviceService.listOwn(req.user.id)
  successResponse(res, { message: 'Your services', data: { services } })
})

export const createService = asyncHandler(async (req, res) => {
  const service = await serviceService.createOwnService(req.user.id, req.body)
  successResponse(res, { statusCode: 201, message: 'Service created', data: { service } })
})

export const updateService = asyncHandler(async (req, res) => {
  const service = await serviceService.updateOwnService(req.params.id, req.user.id, req.body)
  successResponse(res, { message: 'Service updated', data: { service } })
})

export const deleteService = asyncHandler(async (req, res) => {
  await serviceService.deleteOwnService(req.params.id, req.user.id)
  successResponse(res, { message: 'Service deleted' })
})
