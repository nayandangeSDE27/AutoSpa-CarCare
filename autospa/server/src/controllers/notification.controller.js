import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import notificationService from '../services/notification.service.js'

export const list = asyncHandler(async (req, res) => {
  const result = await notificationService.list(req.user.id, req.validatedQuery)
  successResponse(res, { message: 'Notifications', data: result })
})

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markRead(req.params.id, req.user.id)
  successResponse(res, { message: 'Notification marked read', data: { notification } })
})

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user.id)
  successResponse(res, { message: 'All notifications marked read' })
})

export const remove = asyncHandler(async (req, res) => {
  await notificationService.remove(req.params.id, req.user.id)
  successResponse(res, { message: 'Notification deleted' })
})
