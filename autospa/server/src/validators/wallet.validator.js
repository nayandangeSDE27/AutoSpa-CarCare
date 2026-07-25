import { z } from 'zod'

export const topUpSchema = z.object({
  amount: z.number().positive('Top-up amount must be positive'),
})
