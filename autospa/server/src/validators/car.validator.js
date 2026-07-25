import { z } from 'zod'

const currentYear = 2100

export const createCarSchema = z.object({
  make: z.string().trim().min(1, 'Make is required'),
  model: z.string().trim().min(1, 'Model is required'),
  year: z
    .number()
    .int()
    .min(1900, 'Year must be 1900 or later')
    .max(currentYear, 'Year is invalid')
    .optional(),
  licensePlate: z.string().trim().min(1, 'License plate is required'),
  color: z.string().trim().optional(),
  fuelType: z.string().trim().optional(),
})

// All fields optional for updates, but at least one must be present.
export const updateCarSchema = createCarSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Provide at least one field to update' }
)
