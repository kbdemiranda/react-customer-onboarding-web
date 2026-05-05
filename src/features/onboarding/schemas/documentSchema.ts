import { z } from 'zod'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/png', 'image/jpeg'] as const

export const documentTypeSchema = z.enum(['CPF', 'IDENTITY_REGISTER', 'DRIVER_LICENSE', 'PASSPORT', 'PROOF_OF_ADDRESS'], {
  error: 'Tipo de documento é obrigatório',
})

const fileSchema = z
  .instanceof(File, { message: 'Arquivo é obrigatório' })
  .refine((file) => ALLOWED_FILE_TYPES.includes(file.type as (typeof ALLOWED_FILE_TYPES)[number]), {
    message: 'Formato inválido. Envie PDF, PNG ou JPG',
  })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: 'O arquivo deve ter no máximo 10MB',
  })

export const documentItemSchema = z.object({
  documentType: documentTypeSchema,
  file: fileSchema,
})

export const documentSchema = z.object({
  documents: z.array(documentItemSchema).min(1, 'Adicione pelo menos um documento'),
  identityType: z.enum(['RG', 'CNH']).optional(),
  cnhDigital: z.boolean().optional(),
})

export type DocumentSchema = z.infer<typeof documentSchema>
export type DocumentItemSchema = z.infer<typeof documentItemSchema>
