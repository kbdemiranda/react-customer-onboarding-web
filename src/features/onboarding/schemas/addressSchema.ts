import { z } from 'zod'

function normalizeZipCode(value: string) {
  return value.replace(/\D/g, '')
}

const addressItemSchema = z.object({
  zipCode: z
    .string()
    .min(1, 'CEP é obrigatório')
    .refine((value) => /^\d{8}$/.test(normalizeZipCode(value)), 'CEP inválido. Use o formato 00000-000 ou 00000000'),
  number: z.string().trim().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  primaryAddress: z.boolean(),
})

export const addressSchema = z
  .object({
    addresses: z.array(addressItemSchema).min(1, 'Adicione pelo menos um endereço'),
  })
  .superRefine((data, ctx) => {
    const primaryAddressCount = data.addresses.filter((item) => item.primaryAddress).length

    if (primaryAddressCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecione no máximo um endereço principal',
        path: ['addresses'],
      })
    }
  })

export type AddressSchema = z.infer<typeof addressSchema>
export type AddressItemSchema = z.infer<typeof addressItemSchema>
