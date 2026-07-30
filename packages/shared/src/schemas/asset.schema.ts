import { z } from 'zod'

export const CreateAssetSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100),
  type: z.enum(['APARTMENT', 'HOUSE', 'CAR', 'LAND', 'COMMERCIAL', 'MOTORCYCLE', 'BOAT', 'OTHER']),
  description: z.string().max(500).optional(),
  totalValue: z.number().nonnegative().optional(),
  acquisitionDate: z.string().optional(),
})

export const UpdateAssetSchema = CreateAssetSchema.partial().extend({
  status: z.enum(['ACTIVE', 'SOLD', 'ARCHIVED']).optional(),
  coverImageUrl: z.string().url().optional(),
})

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  icon: z.string().optional(),
  order: z.number().int().nonnegative().optional(),
})

export type CreateAssetInput = z.infer<typeof CreateAssetSchema>
export type UpdateAssetInput = z.infer<typeof UpdateAssetSchema>
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>
