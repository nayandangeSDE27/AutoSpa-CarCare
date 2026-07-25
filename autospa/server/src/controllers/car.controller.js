import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import carService from '../services/car.service.js'

export const createCar = asyncHandler(async (req, res) => {
  const car = await carService.createCar(req.user.id, req.body)
  successResponse(res, { statusCode: 201, message: 'Car created', data: { car } })
})

export const listCars = asyncHandler(async (req, res) => {
  const cars = await carService.listCars(req.user.id)
  successResponse(res, { message: 'Your cars', data: { cars } })
})

export const getCar = asyncHandler(async (req, res) => {
  const car = await carService.getCar(req.params.id, req.user.id)
  successResponse(res, { message: 'Car', data: { car } })
})

export const updateCar = asyncHandler(async (req, res) => {
  const car = await carService.updateCar(req.params.id, req.user.id, req.body)
  successResponse(res, { message: 'Car updated', data: { car } })
})

export const deleteCar = asyncHandler(async (req, res) => {
  await carService.deleteCar(req.params.id, req.user.id)
  successResponse(res, { message: 'Car deleted' })
})
