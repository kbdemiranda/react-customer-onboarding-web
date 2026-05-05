import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import { searchZipCode } from '../api/onboardingApi'
import { addressSchema } from '../schemas/addressSchema'
import type { AddressFormData } from '../types/onboarding.types'

export type AddressStepProps = {
  defaultValues?: Partial<AddressFormData>
  onBack: () => void
  onSubmit: (data: AddressFormData) => Promise<void> | void
}

const emptyAddress = {
  zipCode: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  primaryAddress: false,
}

function maskZipCode(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8)

  if (digits.length <= 5) {
    return digits
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`
}

export function AddressStep({ defaultValues, onBack, onSubmit }: AddressStepProps) {
  const [zipLookupLoading, setZipLookupLoading] = useState<Record<number, boolean>>({})
  const [zipLookupMessage, setZipLookupMessage] = useState<Record<number, string | null>>({})

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      addresses: defaultValues?.addresses?.length ? defaultValues.addresses : [emptyAddress],
    },
  })

  const {
    fields: addressFields,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({
    control,
    name: 'addresses',
  })

  const addresses = watch('addresses')

  const handlePrimaryAddressChange = (index: number, checked: boolean) => {
    addressFields.forEach((_, fieldIndex) => {
      setValue(`addresses.${fieldIndex}.primaryAddress`, fieldIndex === index ? checked : false, {
        shouldDirty: true,
        shouldValidate: true,
      })
    })
  }

  const handleZipCodeChange = (index: number, value: string) => {
    const maskedValue = maskZipCode(value)
    const sanitizedZipCode = maskedValue.replace(/\D/g, '')

    setValue(`addresses.${index}.zipCode`, maskedValue, {
      shouldDirty: true,
      shouldValidate: true,
    })

    if (sanitizedZipCode.length < 8) {
      setZipLookupMessage((previous) => ({
        ...previous,
        [index]: null,
      }))
    }
  }

  const applyLookupField = (path: `addresses.${number}.zipCode` | `addresses.${number}.street` | `addresses.${number}.neighborhood` | `addresses.${number}.city` | `addresses.${number}.state`, value?: string) => {
    if (!value) {
      return
    }

    setValue(path, value, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const handleZipCodeBlur = async (index: number) => {
    const zipCodeValue = watch(`addresses.${index}.zipCode`) ?? ''
    const sanitizedZipCode = zipCodeValue.replace(/\D/g, '')

    if (sanitizedZipCode.length !== 8) {
      return
    }

    setZipLookupLoading((previous) => ({
      ...previous,
      [index]: true,
    }))
    setZipLookupMessage((previous) => ({
      ...previous,
      [index]: null,
    }))

    try {
      const result = await searchZipCode(sanitizedZipCode)
      const hasAddressData = Boolean(result.street || result.neighborhood || result.city || result.state || result.zipCode)

      if (!hasAddressData) {
        setZipLookupMessage((previous) => ({
          ...previous,
          [index]: 'CEP não encontrado',
        }))
        return
      }

      applyLookupField(`addresses.${index}.zipCode`, result.zipCode ? maskZipCode(result.zipCode) : undefined)
      applyLookupField(`addresses.${index}.street`, result.street)
      applyLookupField(`addresses.${index}.neighborhood`, result.neighborhood)
      applyLookupField(`addresses.${index}.city`, result.city)
      applyLookupField(`addresses.${index}.state`, result.state)
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          setZipLookupMessage((previous) => ({
            ...previous,
            [index]: 'CEP não encontrado',
          }))
          return
        }

        if (error.code === 'ERR_NETWORK' || !error.response) {
          setZipLookupMessage((previous) => ({
            ...previous,
            [index]: 'Não foi possível conectar ao servidor.',
          }))
          return
        }
      }

      setZipLookupMessage((previous) => ({
        ...previous,
        [index]: 'Não foi possível buscar o CEP.',
      }))
    } finally {
      setZipLookupLoading((previous) => ({
        ...previous,
        [index]: false,
      }))
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Endereço</h1>
        <p className="mt-2 text-sm text-slate-600">Informe seu endereço para continuar o cadastro.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Endereços</h2>
            <button
              type="button"
              onClick={() => appendAddress({ ...emptyAddress })}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Adicionar endereço
            </button>
          </div>

          <div className="space-y-4">
            {addressFields.map((field, index) => (
              <div key={field.id} className="rounded-lg border border-slate-200 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor={`addresses.${index}.zipCode`} className="block text-sm font-medium text-slate-700">
                      CEP
                    </label>
                    <input
                      id={`addresses.${index}.zipCode`}
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      placeholder="00000-000"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      {...register(`addresses.${index}.zipCode`)}
                      value={addresses?.[index]?.zipCode ?? ''}
                      onChange={(event) => handleZipCodeChange(index, event.target.value)}
                      onBlur={() => {
                        void handleZipCodeBlur(index)
                      }}
                    />
                    {errors.addresses?.[index]?.zipCode ? (
                      <p className="text-sm text-red-600">{errors.addresses[index]?.zipCode?.message}</p>
                    ) : null}
                    {zipLookupLoading[index] ? <p className="text-sm text-slate-600">Buscando endereço...</p> : null}
                    {zipLookupMessage[index] ? <p className="text-sm text-red-600">{zipLookupMessage[index]}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`addresses.${index}.street`} className="block text-sm font-medium text-slate-700">
                      Logradouro
                    </label>
                    <input
                      id={`addresses.${index}.street`}
                      type="text"
                      autoComplete="address-line1"
                      placeholder="Digite o logradouro"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      {...register(`addresses.${index}.street`)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`addresses.${index}.number`} className="block text-sm font-medium text-slate-700">
                      Número
                    </label>
                    <input
                      id={`addresses.${index}.number`}
                      type="text"
                      autoComplete="address-line2"
                      placeholder="Digite o número"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      {...register(`addresses.${index}.number`)}
                    />
                    {errors.addresses?.[index]?.number ? (
                      <p className="text-sm text-red-600">{errors.addresses[index]?.number?.message}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label
                      htmlFor={`addresses.${index}.complement`}
                      className="block text-sm font-medium text-slate-700"
                    >
                      Complemento
                    </label>
                    <input
                      id={`addresses.${index}.complement`}
                      type="text"
                      autoComplete="address-line2"
                      placeholder="Apartamento, bloco, referência (opcional)"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      {...register(`addresses.${index}.complement`)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor={`addresses.${index}.neighborhood`}
                      className="block text-sm font-medium text-slate-700"
                    >
                      Bairro
                    </label>
                    <input
                      id={`addresses.${index}.neighborhood`}
                      type="text"
                      autoComplete="address-level3"
                      placeholder="Digite o bairro"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      {...register(`addresses.${index}.neighborhood`)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`addresses.${index}.city`} className="block text-sm font-medium text-slate-700">
                      Cidade
                    </label>
                    <input
                      id={`addresses.${index}.city`}
                      type="text"
                      autoComplete="address-level2"
                      placeholder="Digite a cidade"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      {...register(`addresses.${index}.city`)}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <label htmlFor={`addresses.${index}.state`} className="block text-sm font-medium text-slate-700">
                      Estado
                    </label>
                    <input
                      id={`addresses.${index}.state`}
                      type="text"
                      autoComplete="address-level1"
                      placeholder="Digite o estado"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                      {...register(`addresses.${index}.state`)}
                    />
                  </div>
                </div>

                <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      {...register(`addresses.${index}.primaryAddress`)}
                      onChange={(event) => handlePrimaryAddressChange(index, event.target.checked)}
                    />
                    Endereço principal
                  </label>

                  {addressFields.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeAddress(index)}
                      className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Remover
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>

          {errors.addresses?.message ? <p className="mt-3 text-sm text-red-600">{errors.addresses.message}</p> : null}
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
