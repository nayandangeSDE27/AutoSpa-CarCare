import { z } from 'zod'

export const createServiceSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional(),
  price: z.number().min(0, 'Price must be >= 0'),
  durationMinutes: z.number().int().min(1, 'Duration must be >= 1 minute'),
  category: z.string().trim().optional(),
  isActive: z.boolean().optional(),
  isPopular: z.boolean().optional(),
})

export const updateServiceSchema = createServiceSchema
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: 'Provide at least one field to update' })
