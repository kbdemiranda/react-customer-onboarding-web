import { zodResolver } from '@hookform/resolvers/zod'
import { ShieldCheck } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { personalDataSchema } from '../schemas/personalDataSchema'
import type { PersonalDataFormData } from '../types/onboarding.types'

export type PersonalDataStepProps = {
  defaultValues?: Partial<PersonalDataFormData>
  onSubmit: (data: PersonalDataFormData) => Promise<void> | void
}

function maskCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 3) {
    return digits
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`
  }

  if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

function maskDate(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)

  if (digits.length <= 2) {
    return digits
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function PersonalDataStep({ defaultValues, onSubmit }: PersonalDataStepProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PersonalDataFormData>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: {
      fullName: defaultValues?.fullName ?? '',
      cpf: defaultValues?.cpf ?? '',
      birthDate: defaultValues?.birthDate ?? '',
    },
  })

  const cpfValue = watch('cpf')
  const birthDateValue = watch('birthDate')

  useEffect(() => {
    const maskedValue = maskCpf(cpfValue ?? '')
    if (cpfValue !== maskedValue) {
      setValue('cpf', maskedValue, { shouldDirty: true })
    }
  }, [cpfValue, setValue])

  useEffect(() => {
    const maskedValue = maskDate(birthDateValue ?? '')
    if (birthDateValue !== maskedValue) {
      setValue('birthDate', maskedValue, { shouldDirty: true })
    }
  }, [birthDateValue, setValue])

  return (
    <div className="mx-auto w-full">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-[22px] font-semibold text-[#0F172A]">Dados Pessoais</h2>
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-[13px] font-medium text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Ambiente Seguro
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
            Nome completo
          </label>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            className="w-full rounded-md border border-slate-300 px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#003399] focus:ring-1 focus:ring-[#003399]"
            placeholder="Ex: João Silva Santos"
            {...register('fullName')}
          />
          {errors.fullName ? <p className="text-sm text-red-600">{errors.fullName.message}</p> : null}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="cpf" className="block text-sm font-medium text-slate-700">
              CPF
            </label>
            <input
              id="cpf"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className="w-full rounded-md border border-slate-300 px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#003399] focus:ring-1 focus:ring-[#003399]"
              placeholder="000.000.000-00"
              {...register('cpf')}
            />
            {errors.cpf ? <p className="text-sm text-red-600">{errors.cpf.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="birthDate" className="block text-sm font-medium text-slate-700">
              Data de Nascimento
            </label>
            <input
              id="birthDate"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              className="w-full rounded-md border border-slate-300 px-4 py-3 text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#003399] focus:ring-1 focus:ring-[#003399]"
              placeholder="DD/MM/AAAA"
              {...register('birthDate')}
            />
            {errors.birthDate ? <p className="text-sm text-red-600">{errors.birthDate.message}</p> : null}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-md bg-[#003399] px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#002266] disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? 'Continuando...' : 'Continuar'}
          </button>
          <p className="mt-5 text-center text-[13px] text-slate-500">
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="font-semibold text-[#003399] hover:underline">
              Termos de Uso
            </a>
            .
          </p>
        </div>
      </form>
    </div>
  )
}
