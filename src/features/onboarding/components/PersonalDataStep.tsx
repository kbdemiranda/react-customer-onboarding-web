import { zodResolver } from '@hookform/resolvers/zod'
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
    },
  })

  const cpfValue = watch('cpf')

  useEffect(() => {
    const maskedValue = maskCpf(cpfValue ?? '')
    if (cpfValue !== maskedValue) {
      setValue('cpf', maskedValue, { shouldDirty: true })
    }
  }, [cpfValue, setValue])

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Dados pessoais</h1>
        <p className="mt-2 text-sm text-slate-600">Preencha seus dados para iniciar o cadastro.</p>
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            placeholder="Digite seu nome completo"
            {...register('fullName')}
          />
          {errors.fullName ? <p className="text-sm text-red-600">{errors.fullName.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="cpf" className="block text-sm font-medium text-slate-700">
            CPF
          </label>
          <input
            id="cpf"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            placeholder="000.000.000-00"
            {...register('cpf')}
          />
          {errors.cpf ? <p className="text-sm text-red-600">{errors.cpf.message}</p> : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? 'Continuando...' : 'Continuar'}
        </button>
      </form>
    </div>
  )
}
