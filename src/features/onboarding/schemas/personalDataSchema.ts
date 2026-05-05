import { z } from 'zod'

function normalizeDigits(value: string) {
  return value.replace(/\D/g, '')
}

function isValidCpf(cpf: string): boolean {
  const cleanCpf = normalizeDigits(cpf)
  if (cleanCpf.length !== 11) return false
  if (/^(\d)\1+$/.test(cleanCpf)) return false

  let sum = 0
  let remainder

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (11 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCpf.substring(9, 10))) return false

  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCpf.substring(i - 1, i)) * (12 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCpf.substring(10, 11))) return false

  return true
}

export const personalDataSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Nome completo é obrigatório')
    .min(3, 'Nome completo deve ter no mínimo 3 caracteres'),
  birthDate: z
    .string()
    .min(1, 'Data de nascimento é obrigatória')
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Use o formato DD/MM/AAAA'),
  nationality: z.enum(['brasileiro', 'estrangeiro'], { error: 'Selecione a nacionalidade' }),
  cpf: z.string().optional(),
  crnm: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.nationality === 'brasileiro') {
    if (!data.cpf || data.cpf.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CPF é obrigatório',
        path: ['cpf'],
      })
    } else if (!isValidCpf(data.cpf)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CPF inválido',
        path: ['cpf'],
      })
    }
  } else if (data.nationality === 'estrangeiro') {
    if (!data.crnm || data.crnm.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CRNM é obrigatório',
        path: ['crnm'],
      })
    } else if (data.crnm.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CRNM inválido',
        path: ['crnm'],
      })
    }
  }
})

export type PersonalDataSchema = z.infer<typeof personalDataSchema>
