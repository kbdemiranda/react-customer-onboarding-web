import { zodResolver } from '@hookform/resolvers/zod'
import { AtSign, Info, Mail, Smartphone, ArrowRight, Shield, Plus, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import { contactSchema } from '../schemas/contactSchema'
import type { ContactFormData } from '../types/onboarding.types'

export type ContactStepProps = {
  defaultValues?: Partial<ContactFormData>
  onBack: () => void
  onSubmit: (data: ContactFormData) => Promise<void> | void
}

const emptyEmail = { email: '', confirmEmail: '', primaryEmail: true }
const emptyPhone = { phoneNumber: '', primaryPhone: true }

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 2) {
    return digits.length > 0 ? `(${digits}` : ''
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function ContactStep({ defaultValues, onBack, onSubmit }: ContactStepProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      emails: defaultValues?.emails?.length
        ? defaultValues.emails.map((e) => ({ ...e, confirmEmail: e.email }))
        : [emptyEmail],
      phones: defaultValues?.phones?.length ? defaultValues.phones : [emptyPhone],
    },
  })

  const {
    fields: emailFields,
    append: appendEmail,
    remove: removeEmail,
  } = useFieldArray({
    control,
    name: 'emails',
  })

  const {
    fields: phoneFields,
    append: appendPhone,
    remove: removePhone,
  } = useFieldArray({
    control,
    name: 'phones',
  })

  const emailsWatch = watch('emails')
  const phonesWatch = watch('phones')

  useEffect(() => {
    if (emailsWatch.length === 1 && emailsWatch[0] && !emailsWatch[0].primaryEmail) {
      setValue('emails.0.primaryEmail', true, { shouldValidate: true })
    }
  }, [emailsWatch, setValue])

  useEffect(() => {
    if (phonesWatch.length === 1 && phonesWatch[0] && !phonesWatch[0].primaryPhone) {
      setValue('phones.0.primaryPhone', true, { shouldValidate: true })
    }
  }, [phonesWatch, setValue])

  const handlePrimaryEmailChange = (index: number, checked: boolean) => {
    emailFields.forEach((_, fieldIndex) => {
      setValue(`emails.${fieldIndex}.primaryEmail`, fieldIndex === index ? checked : false, {
        shouldDirty: true,
        shouldValidate: true,
      })
    })
  }

  const handlePrimaryPhoneChange = (index: number, checked: boolean) => {
    phoneFields.forEach((_, fieldIndex) => {
      setValue(`phones.${fieldIndex}.primaryPhone`, fieldIndex === index ? checked : false, {
        shouldDirty: true,
        shouldValidate: true,
      })
    })
  }

  return (
    <div className="mx-auto w-full">
      <div className="mb-10 space-y-3">
        <h2 className="text-[26px] font-bold text-[#0F172A]">Informações de Contato</h2>
        <p className="text-[15px] text-slate-600 leading-relaxed">
          Precisamos desses dados para garantir a segurança da sua conta e enviar atualizações importantes.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
        
        {/* Emails Section */}
        <div className="space-y-6">
          {emailFields.map((field, index) => (
            <div key={field.id} className="space-y-4">
              {emailFields.length > 1 && (
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">E-mail {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeEmail(index)}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remover
                  </button>
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor={`emails.${index}.email`} className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                  E-mail
                </label>
                <div className="relative">
                  <input
                    id={`emails.${index}.email`}
                    type="email"
                    autoComplete="email"
                    placeholder="seuemail@exemplo.com"
                    className="w-full rounded-md border border-slate-300 px-4 py-3 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#003399] focus:ring-1 focus:ring-[#003399]"
                    {...register(`emails.${index}.email`)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Mail className="h-5 w-5" />
                  </div>
                </div>
                {errors.emails?.[index]?.email ? (
                  <p className="text-sm text-red-600">{errors.emails[index]?.email?.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label htmlFor={`emails.${index}.confirmEmail`} className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                  Confirmar E-mail
                </label>
                <div className="relative">
                  <input
                    id={`emails.${index}.confirmEmail`}
                    type="email"
                    autoComplete="off"
                    placeholder="Repita seu e-mail"
                    className="w-full rounded-md border border-slate-300 px-4 py-3 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#003399] focus:ring-1 focus:ring-[#003399]"
                    {...register(`emails.${index}.confirmEmail`)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <AtSign className="h-5 w-5" />
                  </div>
                </div>
                {errors.emails?.[index]?.confirmEmail ? (
                  <p className="text-sm text-red-600">{errors.emails[index]?.confirmEmail?.message}</p>
                ) : null}
              </div>

              {emailFields.length > 1 && (
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-[#003399] focus:ring-[#003399]"
                    {...register(`emails.${index}.primaryEmail`)}
                    onChange={(event) => handlePrimaryEmailChange(index, event.target.checked)}
                  />
                  Definir como e-mail principal
                </label>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => appendEmail({ ...emptyEmail, primaryEmail: false })}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#003399] hover:underline"
          >
            <Plus className="h-4 w-4" />
            Adicionar outro e-mail
          </button>

          {errors.emails?.message && typeof errors.emails.message === 'string' && (
            <p className="mt-2 text-sm font-medium text-red-600">{errors.emails.message}</p>
          )}
        </div>

        <div className="h-px w-full bg-slate-200" />

        {/* Phones Section */}
        <div className="space-y-6">
          {phoneFields.map((field, index) => (
            <div key={field.id} className="space-y-4">
              {phoneFields.length > 1 && (
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">Telefone {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removePhone(index)}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:underline"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remover
                  </button>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor={`phones.${index}.phoneNumber`} className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                  Celular
                </label>
                <div className="relative">
                  <input
                    id={`phones.${index}.phoneNumber`}
                    type="text"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-md border border-slate-300 px-4 py-3 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#003399] focus:ring-1 focus:ring-[#003399]"
                    {...register(`phones.${index}.phoneNumber`)}
                    onChange={(e) => {
                      e.target.value = maskPhone(e.target.value)
                      register(`phones.${index}.phoneNumber`).onChange(e)
                    }}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Smartphone className="h-5 w-5" />
                  </div>
                </div>
                {errors.phones?.[index]?.phoneNumber ? (
                  <p className="text-sm text-red-600">{errors.phones[index]?.phoneNumber?.message}</p>
                ) : null}
              </div>

              {index === 0 && (
                <div className="flex items-start gap-2 text-slate-500">
                  <Info className="h-4 w-4 shrink-0 translate-y-0.5" />
                  <p className="text-[13px]">Enviaremos um código SMS para validação no próximo passo.</p>
                </div>
              )}

              {phoneFields.length > 1 && (
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 text-[#003399] focus:ring-[#003399]"
                    {...register(`phones.${index}.primaryPhone`)}
                    onChange={(event) => handlePrimaryPhoneChange(index, event.target.checked)}
                  />
                  Definir como celular principal
                </label>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => appendPhone({ ...emptyPhone, primaryPhone: false })}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#003399] hover:underline"
          >
            <Plus className="h-4 w-4" />
            Adicionar outro celular
          </button>

          {errors.phones?.message && typeof errors.phones.message === 'string' && (
            <p className="mt-2 text-sm font-medium text-red-600">{errors.phones.message}</p>
          )}
        </div>

        <div className="pt-2 pb-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex w-full items-center justify-center rounded-md border border-[#003399] px-4 py-3.5 text-[15px] font-semibold text-[#003399] transition hover:bg-blue-50"
            >
              Voltar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#003399] px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#002266] disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSubmitting ? 'Continuando...' : 'Continuar'}
              {!isSubmitting && <ArrowRight className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-xl border border-blue-100 bg-[#F4F7FB] p-5">
          <Shield className="h-6 w-6 shrink-0 text-[#003399]" fill="#003399" stroke="#fff" />
          <p className="text-[13px] text-slate-600 leading-relaxed">
            <strong className="text-slate-900 font-semibold">Privacidade em primeiro lugar.</strong>{' '}
            Seus dados de contato são criptografados com AES-256 e nunca serão compartilhados com terceiros sem seu consentimento explícito.
          </p>
        </div>

      </form>
    </div>
  )
}
