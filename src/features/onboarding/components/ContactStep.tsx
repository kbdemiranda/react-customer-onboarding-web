import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'

import { contactSchema } from '../schemas/contactSchema'
import type { ContactFormData } from '../types/onboarding.types'

export type ContactStepProps = {
  defaultValues?: Partial<ContactFormData>
  onBack: () => void
  onSubmit: (data: ContactFormData) => Promise<void> | void
}

const emptyEmail = { email: '', primaryEmail: false }
const emptyPhone = { phoneNumber: '', primaryPhone: false }

export function ContactStep({ defaultValues, onBack, onSubmit }: ContactStepProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      emails: defaultValues?.emails?.length ? defaultValues.emails : [emptyEmail],
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
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Contato</h1>
        <p className="mt-2 text-sm text-slate-600">Informe os canais principais para acompanhamento do cadastro.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">E-mails</h2>
            <button
              type="button"
              onClick={() => appendEmail({ ...emptyEmail })}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Adicionar e-mail
            </button>
          </div>

          <div className="space-y-4">
            {emailFields.map((field, index) => (
              <div key={field.id} className="rounded-lg border border-slate-200 p-4">
                <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                  <div className="space-y-2">
                    <label htmlFor={`emails.${index}.email`} className="block text-sm font-medium text-slate-700">
                      E-mail
                    </label>
                    <input
                      id={`emails.${index}.email`}
                      type="email"
                      autoComplete="email"
                      placeholder="nome@exemplo.com"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      {...register(`emails.${index}.email`)}
                    />
                    {errors.emails?.[index]?.email ? (
                      <p className="text-sm text-red-600">{errors.emails[index]?.email?.message}</p>
                    ) : null}
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      {...register(`emails.${index}.primaryEmail`)}
                      onChange={(event) => handlePrimaryEmailChange(index, event.target.checked)}
                    />
                    Principal
                  </label>

                  {emailFields.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeEmail(index)}
                      className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Remover
                    </button>
                  ) : (
                    <span className="hidden sm:block" aria-hidden="true" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {errors.emails?.message ? <p className="mt-3 text-sm text-red-600">{errors.emails.message}</p> : null}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Telefones</h2>
            <button
              type="button"
              onClick={() => appendPhone({ ...emptyPhone })}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Adicionar telefone
            </button>
          </div>

          <div className="space-y-4">
            {phoneFields.map((field, index) => (
              <div key={field.id} className="rounded-lg border border-slate-200 p-4">
                <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                  <div className="space-y-2">
                    <label htmlFor={`phones.${index}.phoneNumber`} className="block text-sm font-medium text-slate-700">
                      Telefone
                    </label>
                    <input
                      id={`phones.${index}.phoneNumber`}
                      type="text"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="(00) 00000-0000"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      {...register(`phones.${index}.phoneNumber`)}
                    />
                    {errors.phones?.[index]?.phoneNumber ? (
                      <p className="text-sm text-red-600">{errors.phones[index]?.phoneNumber?.message}</p>
                    ) : null}
                  </div>

                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      {...register(`phones.${index}.primaryPhone`)}
                      onChange={(event) => handlePrimaryPhoneChange(index, event.target.checked)}
                    />
                    Principal
                  </label>

                  {phoneFields.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removePhone(index)}
                      className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Remover
                    </button>
                  ) : (
                    <span className="hidden sm:block" aria-hidden="true" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {errors.phones?.message ? <p className="mt-3 text-sm text-red-600">{errors.phones.message}</p> : null}
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            Voltar
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 sm:w-auto"
          >
            {isSubmitting ? 'Continuando...' : 'Continuar'}
          </button>
        </div>
      </form>
    </div>
  )
}
