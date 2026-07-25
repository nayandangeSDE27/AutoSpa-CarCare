import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'
import ApiError from '../utils/ApiError.js'
import cloudinary from '../utils/cloudinary.js'

/**
 * Generic authenticated image upload → returns a hosted URL (real Cloudinary
 * when configured, else a deterministic mock URL). Used for booking before/after
 * photos and any ad-hoc image needs.
 */
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image file provided')
  const result = await cloudinary.uploadImage(req.file.buffer, {
    folder: `autospa/uploads/${req.user.id}`,
    filename: `img-${Date.now()}`,
  })
  successResponse(res, { message: 'Uploaded', data: { url: result.url, mocked: result.mocked } })
})
