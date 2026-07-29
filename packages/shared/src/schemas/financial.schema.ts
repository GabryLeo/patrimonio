import { z } from 'zod'

export const CreateFinancialRecordSchema = z.object({
  categoryId: z.string().optional(),
  title: z.string().min(1, 'Título obrigatório').max(200),
  amount: z.number().positive('Valor deve ser positivo'),
  eventDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  notes: z.string().max(1000).optional(),
})

export const UpdateFinancialRecordSchema = CreateFinancialRecordSchema.partial()

export const CreateMemorySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  eventDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
})

export type CreateFinancialRecordInput = z.infer<typeof CreateFinancialRecordSchema>
export type UpdateFinancialRecordInput = z.infer<typeof UpdateFinancialRecordSchema>
export type CreateMemoryInput = z.infer<typeof CreateMemorySchema>
