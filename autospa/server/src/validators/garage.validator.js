import { z } from 'zod'

// Query coercion: querystring values arrive as strings.
const numeric = (name) =>
  z.coerce.number({ invalid_type_error: `${name} must be a number` })

export const nearbyQuerySchema = z.object({
  lng: numeric('lng').min(-180).max(180),
  lat: numeric('lat').min(-90).max(90),
  radius: numeric('radius').positive().default(5000), // metres
})

export const servicesQuerySchema = z.object({
  garageId: z.string().trim().min(1, 'garageId is required'),
})

// ----- Garage-owner profile schemas -----
const hhmm = z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:mm')
const workingHour = z.object({
  day: z.number().int().min(0).max(6),
  open: hhmm.optional(),
  close: hhmm.optional(),
  isClosed: z.boolean().optional(),
})
const geo = z.object({
  lng: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
})

export const createGarageSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  description: z.string().trim().optional(),
  address: z.string().trim().optional(),
  location: geo,
  serviceBays: z.number().int().min(1, 'At least one service bay'),
  workingHours: z.array(workingHour).optional(),
  slotDurationMinutes: z.number().int().min(5).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  autoAcceptBookings: z.boolean().optional(),
})

export const updateGarageSchema = createGarageSchema
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: 'Provide at least one field to update' })

export const gallerySchema = z.object({
  images: z.array(z.string().url('Each image must be a URL')).min(1, 'Provide at least one image URL'),
})

export const documentsSchema = z.object({
  documents: z
    .array(
      z.object({
        type: z.string().trim().min(1, 'Document type is required'),
        url: z.string().url('Document url must be a URL'),
      })
    )
    .min(1, 'Provide at least one document'),
})

export const slotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD'),
  // "id1,id2" -> ["id1","id2"]
  serviceIds: z
    .string()
    .min(1, 'serviceIds is required')
    .transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean)),
})
