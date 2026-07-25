import multer from 'multer'

/**
 * Multer in-memory upload — buffers files so utils/cloudinary can stream them.
 * Images only, 5 MB each.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true)
    return cb(new Error('Only image files are allowed'))
  },
})

export default upload
