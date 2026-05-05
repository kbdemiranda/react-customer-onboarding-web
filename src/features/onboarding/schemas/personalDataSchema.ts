import { z } from 'zod'

function normalizeCpf(value: string) {
  return value.replace(/\D/g, '')
}

export const personalDataSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Nome completo é obrigatório')
    .min(3, 'Nome completo deve ter no mínimo 3 caracteres'),
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .refine((value) => {
      const normalizedCpf = normalizeCpf(value)
      return /^\d{11}$/.test(normalizedCpf)
    }, 'CPF inválido. Use o formato 000.000.000-00 ou 00000000000'),
  birthDate: z
    .string()
    .min(1, 'Data de nascimento é obrigatória')
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Use o formato DD/MM/AAAA'),
})

export type PersonalDataSchema = z.infer<typeof personalDataSchema>
