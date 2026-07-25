import { z } from 'zod'
import { WORKER_STATUS } from '../models/worker.model.js'

export const createWorkerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  phone: z.string().trim().optional(),
  speciality: z.string().trim().optional(),
  status: z.enum(WORKER_STATUS).optional(),
})

export const updateWorkerSchema = createWorkerSchema
  .partial()
  .refine((d) => Object.keys(d).length > 0, { message: 'Provide at least one field to update' })

export const workerStatusSchema = z.object({
  status: z.enum(WORKER_STATUS),
})
