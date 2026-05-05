import { zodResolver } from '@hookform/resolvers/zod'
import { AxiosError } from 'axios'
import { Info, CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
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
  primaryAddress: true,
}

const BRAZILIAN_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

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

  const addressesWatch = watch('addresses')

  useEffect(() => {
    if (addressesWatch?.length === 1 && addressesWatch[0] && !addressesWatch[0].primaryAddress) {
      setValue('addresses.0.primaryAddress', true, { shouldValidate: true })
    }
  }, [addressesWatch, setValue])

  const handlePrimaryAddressChange = (index: number, checked: boolean) => {
    addressFields.forEach((_, fieldIndex) => {
      setValue(`addresses.${fieldIndex}.primaryAddress`, fieldIndex === index ? checked : false, {
        shouldDirty: true,
        shouldValidate: true,
      })
    })
  }

  const handleZipCodeBlur = async (index: number, manualZipCode?: string) => {
    const zipCodeValue = manualZipCode ?? watch(`addresses.${index}.zipCode`) ?? ''
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
    } else if (sanitizedZipCode.length === 8) {
      void handleZipCodeBlur(index, maskedValue)
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

  return (
    <div className="mx-auto w-full">
      <div className="mb-10 space-y-3">
        <h2 className="text-[26px] font-bold text-[#0F172A]">Onde você mora?</h2>
        <p className="text-[15px] text-slate-600 leading-relaxed">
          Precisamos do seu endereço para o envio do cartão físico e verificações de segurança.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        
        <div className="space-y-6">
          {addressFields.map((field, index) => {
            const currentZipCode = addressesWatch?.[index]?.zipCode ?? ''
            const isZipCodeComplete = currentZipCode.replace(/\D/g, '').length === 8

            return (
              <div key={field.id} className="space-y-6">
                {addressFields.length > 1 && (
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Endereço {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeAddress(index)}
                      className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remover
                    </button>
                  </div>
                )}

                {/* CEP */}
                <div className="space-y-2">
                  <label htmlFor={`addresses.${index}.zipCode`} className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                    CEP
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-full sm:w-[240px]">
                      <input
                        id={`addresses.${index}.zipCode`}
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        placeholder="00000-000"
                        className="w-full rounded-md border border-slate-300 px-4 py-3 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#003399] focus:ring-1 focus:ring-[#003399] disabled:bg-slate-50"
                        {...register(`addresses.${index}.zipCode`)}
                        value={addressesWatch?.[index]?.zipCode ?? ''}
                        onChange={(event) => handleZipCodeChange(index, event.target.value)}
                        onBlur={() => {
                          void handleZipCodeBlur(index)
                        }}
                      />
                      {isZipCodeComplete && !zipLookupLoading[index] && !zipLookupMessage[index] && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <a 
                      href="https://buscacepinter.correios.com.br/app/endereco/index.php" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[15px] font-medium text-[#003399] hover:underline whitespace-nowrap"
                    >
                      Não sei meu CEP
                    </a>
                  </div>
                  {errors.addresses?.[index]?.zipCode ? (
                    <p className="text-sm text-red-600">{errors.addresses[index]?.zipCode?.message}</p>
                  ) : null}
                  {zipLookupLoading[index] ? <p className="text-sm text-slate-600">Buscando endereço...</p> : null}
                  {zipLookupMessage[index] ? <p className="text-sm text-red-600">{zipLookupMessage[index]}</p> : null}
                </div>

                {/* Logradouro */}
                <div className="space-y-2">
                  <label htmlFor={`addresses.${index}.street`} className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                    Logradouro
                  </label>
                  <input
                    id={`addresses.${index}.street`}
                    type="text"
                    autoComplete="address-line1"
                    className="w-full rounded-md border border-slate-300 px-4 py-3 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#003399] focus:ring-1 focus:ring-[#003399]"
                    {...register(`addresses.${index}.street`)}
                  />
                </div>

                {/* Número e Complemento */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_2fr]">
                  <div className="space-y-2">
                    <label htmlFor={`addresses.${index}.number`} className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                      Número
                    </label>
                    <input
                      id={`addresses.${index}.number`}
                      type="text"
                      autoComplete="address-line2"
                      className="w-full rounded-md border border-slate-300 px-4 py-3 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#003399] focus:ring-1 focus:ring-[#003399]"
                      {...register(`addresses.${index}.number`)}
                    />
                    {errors.addresses?.[index]?.number ? (
                      <p className="text-sm text-red-600">{errors.addresses[index]?.number?.message}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor={`addresses.${index}.complement`}
                      className="block text-xs font-bold uppercase tracking-wider text-slate-900"
                    >
                      Complemento (Opcional)
                    </label>
                    <input
                      id={`addresses.${index}.complement`}
                      type="text"
                      placeholder="Ex: Apto 42, Bloco B"
                      className="w-full rounded-md border border-slate-300 px-4 py-3 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#003399] focus:ring-1 focus:ring-[#003399]"
                      {...register(`addresses.${index}.complement`)}
                    />
                  </div>
                </div>

                {/* Bairro */}
                <div className="space-y-2">
                  <label
                    htmlFor={`addresses.${index}.neighborhood`}
                    className="block text-xs font-bold uppercase tracking-wider text-slate-900"
                  >
                    Bairro
                  </label>
                  <input
                    id={`addresses.${index}.neighborhood`}
                    type="text"
                    autoComplete="address-level3"
                    className="w-full rounded-md border border-slate-300 px-4 py-3 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#003399] focus:ring-1 focus:ring-[#003399]"
                    {...register(`addresses.${index}.neighborhood`)}
                  />
                </div>

                {/* Cidade e Estado */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-[2fr_1fr]">
                  <div className="space-y-2">
                    <label htmlFor={`addresses.${index}.city`} className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                      Cidade
                    </label>
                    <input
                      id={`addresses.${index}.city`}
                      type="text"
                      autoComplete="address-level2"
                      className="w-full rounded-md border border-slate-300 px-4 py-3 text-[15px] text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#003399] focus:ring-1 focus:ring-[#003399]"
                      {...register(`addresses.${index}.city`)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor={`addresses.${index}.state`} className="block text-xs font-bold uppercase tracking-wider text-slate-900">
                      Estado
                    </label>
                    <div className="relative">
                      <select
                        id={`addresses.${index}.state`}
                        autoComplete="address-level1"
                        className="w-full appearance-none rounded-md border border-slate-300 bg-white px-4 py-3 text-[15px] text-slate-900 shadow-sm outline-none transition focus:border-[#003399] focus:ring-1 focus:ring-[#003399]"
                        {...register(`addresses.${index}.state`)}
                      >
                        <option value="" disabled></option>
                        {BRAZILIAN_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {addressFields.length > 1 && (
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-[#003399] focus:ring-[#003399]"
                      {...register(`addresses.${index}.primaryAddress`)}
                      onChange={(event) => handlePrimaryAddressChange(index, event.target.checked)}
                    />
                    Definir como endereço principal
                  </label>
                )}

                {index < addressFields.length - 1 && (
                  <div className="h-px w-full bg-slate-200 my-8" />
                )}
              </div>
            )
          })}

          <button
            type="button"
            onClick={() => appendAddress({ ...emptyAddress, primaryAddress: false })}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#003399] hover:underline"
          >
            <Plus className="h-4 w-4" />
            Adicionar outro endereço
          </button>

          {errors.addresses?.message && typeof errors.addresses.message === 'string' && (
            <p className="mt-2 text-sm font-medium text-red-600">{errors.addresses.message}</p>
          )}
        </div>

        <div className="pt-6 pb-2">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex w-full sm:w-[140px] items-center justify-center rounded-md border border-slate-300 px-4 py-3.5 text-[15px] font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Voltar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full sm:flex-1 items-center justify-center rounded-md bg-[#003399] px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#002266] disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSubmitting ? 'Continuando...' : 'Continuar'}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-xl bg-[#E8F0FE] p-5">
          <Info className="h-5 w-5 shrink-0 text-[#003399]" />
          <p className="text-[13px] text-slate-700 leading-relaxed">
            Certifique-se de que os dados estão corretos. O seu cartão de crédito Horizon Black será entregue neste endereço em até 5 dias úteis.
          </p>
        </div>

      </form>
    </div>
  )
}
