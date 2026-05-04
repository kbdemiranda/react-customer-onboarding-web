import { z } from 'zod'

const emailItemSchema = z.object({
  email: z.string().trim().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  primaryEmail: z.boolean(),
})

const phoneItemSchema = z.object({
  phoneNumber: z.string().trim().min(1, 'Telefone é obrigatório'),
  primaryPhone: z.boolean(),
})

export const contactSchema = z
  .object({
    emails: z.array(emailItemSchema).min(1, 'Adicione pelo menos um e-mail'),
    phones: z.array(phoneItemSchema).min(1, 'Adicione pelo menos um telefone'),
  })
  .superRefine((data, ctx) => {
    const primaryEmailCount = data.emails.filter((item) => item.primaryEmail).length
    const primaryPhoneCount = data.phones.filter((item) => item.primaryPhone).length

    if (primaryEmailCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecione no máximo um e-mail principal',
        path: ['emails'],
      })
    }

    if (primaryPhoneCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecione no máximo um telefone principal',
        path: ['phones'],
      })
    }

    if (primaryEmailCount + primaryPhoneCount < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecione pelo menos um contato principal entre e-mail e telefone',
        path: ['emails'],
      })
    }
  })

export type ContactSchema = z.infer<typeof contactSchema>
export type EmailSchema = z.infer<typeof emailItemSchema>
export type PhoneSchema = z.infer<typeof phoneItemSchema>
