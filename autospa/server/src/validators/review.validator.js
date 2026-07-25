import { z } from 'zod'

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

export const createReviewSchema = z.object({
  bookingId: objectId,
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
})

export const updateReviewSchema = z
  .object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().trim().max(1000).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Provide rating or comment' })

export const replyReviewSchema = z.object({
  reply: z.string().trim().min(1, 'Reply cannot be empty').max(1000),
})
