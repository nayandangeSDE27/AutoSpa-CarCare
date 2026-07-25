import { z } from 'zod'

export const updateMeSchema = z
  .object({
    name: z.string().trim().min(2).optional(),
    phone: z.string().trim().min(6).optional(),
    avatar: z.string().trim().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'Provide at least one field to update' })

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})
