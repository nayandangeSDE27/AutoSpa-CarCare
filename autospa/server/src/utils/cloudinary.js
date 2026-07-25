import { v2 as cloudinary } from 'cloudinary'

import config from '../config/index.js'
import logger from './logger.js'

/**
 * Image upload helper. Uses REAL Cloudinary when creds are configured; otherwise
 * returns a deterministic mock URL so uploads (and tests) work without creds.
 */
if (config.cloudinary.enabled) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  })
}

/**
 * Upload a Buffer to Cloudinary (folder) and return the secure URL. Falls back
 * to a mock URL when Cloudinary isn't configured.
 * @param {Buffer} buffer
 * @param {object} opts { folder, filename }
 */
export function uploadImage(buffer, { folder = 'autospa', filename = 'upload' } = {}) {
  if (!config.cloudinary.enabled) {
    const mockUrl = `https://mock.local/${folder}/${filename}-${buffer?.length ?? 0}.jpg`
    logger.info(`[cloudinary:mock] ${mockUrl}`)
    return Promise.resolve({ url: mockUrl, mocked: true })
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) return reject(err)
      return resolve({ url: result.secure_url, publicId: result.public_id, mocked: false })
    })
    stream.end(buffer)
  })
}

export default { uploadImage }
