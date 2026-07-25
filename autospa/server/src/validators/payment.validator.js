import { z } from 'zod'

export const createOrderSchema = z.object({
  bookingId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid bookingId'),
  paymentMethod: z.enum(['upi', 'card', 'cash']).optional().default('card'),
})
