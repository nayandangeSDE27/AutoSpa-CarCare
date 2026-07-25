import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import workerService from '../services/worker.service.js'

export const createWorker = asyncHandler(async (req, res) => {
  const worker = await workerService.createWorker(req.user.id, req.body)
  successResponse(res, { statusCode: 201, message: 'Worker created', data: { worker } })
})

export const listWorkers = asyncHandler(async (req, res) => {
  const workers = await workerService.listWorkers(req.user.id)
  successResponse(res, { message: 'Your workers', data: { workers } })
})

export const updateWorker = asyncHandler(async (req, res) => {
  const worker = await workerService.updateWorker(req.params.id, req.user.id, req.body)
  successResponse(res, { message: 'Worker updated', data: { worker } })
})

export const deleteWorker = asyncHandler(async (req, res) => {
  await workerService.deleteWorker(req.params.id, req.user.id)
  successResponse(res, { message: 'Worker deleted' })
})

export const setWorkerStatus = asyncHandler(async (req, res) => {
  const worker = await workerService.setStatus(req.params.id, req.user.id, req.body.status)
  successResponse(res, { message: 'Worker status updated', data: { worker } })
})
