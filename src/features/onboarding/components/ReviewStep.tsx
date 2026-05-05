import { User, Mail, MapPin, Lock, Check } from 'lucide-react'
import { useState } from 'react'

import type { AddressFormData, ContactFormData, DocumentFormData, PersonalDataFormData } from '../types/onboarding.types'

export type ReviewStepProps = {
  personalData: PersonalDataFormData
  contactData: ContactFormData
  addressData: AddressFormData
  documentData: DocumentFormData
  isSubmitting: boolean
  submitError?: string | null
  partialFailureMessage?: string | null
  onBack: () => void
  onSubmit: () => Promise<void> | void
  onEditStep?: (stepIndex: number) => void
}

export function ReviewStep({
  personalData,
  contactData,
  addressData,
  isSubmitting,
  submitError,
  partialFailureMessage,
  onBack,
  onSubmit,
  onEditStep,
}: ReviewStepProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const primaryEmail = contactData.emails.find((e) => e.primaryEmail)?.email ?? contactData.emails[0]?.email
  const primaryPhone = contactData.phones.find((p) => p.primaryPhone)?.phoneNumber ?? contactData.phones[0]?.phoneNumber
  
  const primaryAddress = addressData.addresses.find((a) => a.primaryAddress) ?? addressData.addresses[0]
  const addressStreet = [primaryAddress?.street, primaryAddress?.number, primaryAddress?.complement]
    .filter(Boolean)
    .join(' - ')
  const addressCityState = [primaryAddress?.city, primaryAddress?.state]
    .filter(Boolean)
    .join(' - ')

  return (
    <div className="mx-auto w-full">
      <div className="mb-10 space-y-3">
        <h2 className="text-[26px] font-bold text-[#0F172A]">Revisão do Cadastro</h2>
        <p className="text-[15px] text-slate-600 leading-relaxed">
          Confirme se todas as informações estão corretas antes de finalizar sua abertura de conta.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        
        {/* Dados Pessoais */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 text-[#0F172A]">
              <User className="h-6 w-6 text-[#003399]" />
              <h3 className="text-[19px] font-semibold">Dados Pessoais</h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep ? onEditStep(0) : onBack()}
              className="text-[15px] font-medium text-[#003399] hover:underline"
            >
              Editar
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nome Completo</p>
              <p className="text-[15px] font-medium text-slate-900">{personalData.fullName}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {personalData.nationality === 'brasileiro' ? 'CPF' : 'CRNM'}
              </p>
              <p className="text-[15px] font-medium text-slate-900">
                {personalData.nationality === 'brasileiro' ? personalData.cpf : personalData.crnm}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Data de Nascimento</p>
              <p className="text-[15px] font-medium text-slate-900">{personalData.birthDate}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nacionalidade</p>
              <p className="text-[15px] font-medium text-slate-900 capitalize">{personalData.nationality}</p>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Contato */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 text-[#0F172A]">
              <Mail className="h-6 w-6 text-[#003399]" />
              <h3 className="text-[19px] font-semibold">Contato</h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep ? onEditStep(1) : onBack()}
              className="text-[15px] font-medium text-[#003399] hover:underline"
            >
              Editar
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">E-mail Principal</p>
              <p className="text-[15px] font-medium text-slate-900">{primaryEmail}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Telefone Celular</p>
              <p className="text-[15px] font-medium text-slate-900">{primaryPhone}</p>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Endereço */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 text-[#0F172A]">
              <MapPin className="h-6 w-6 text-[#003399]" />
              <h3 className="text-[19px] font-semibold">Endereço</h3>
            </div>
            <button
              type="button"
              onClick={() => onEditStep ? onEditStep(2) : onBack()}
              className="text-[15px] font-medium text-[#003399] hover:underline"
            >
              Editar
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-8">
            <div className="sm:col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Logradouro</p>
              <p className="text-[15px] font-medium text-slate-900">{addressStreet}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Bairro</p>
              <p className="text-[15px] font-medium text-slate-900">{primaryAddress?.neighborhood}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">CEP</p>
              <p className="text-[15px] font-medium text-slate-900">{primaryAddress?.zipCode}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Cidade / UF</p>
              <p className="text-[15px] font-medium text-slate-900">{addressCityState}</p>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-8">
        <label className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 cursor-pointer hover:bg-slate-50 transition-colors">
          <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${acceptedTerms ? 'border-[#003399] bg-[#003399]' : 'border-slate-300 bg-white'}`}>
            {acceptedTerms && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
          </div>
          <input
            type="checkbox"
            className="hidden"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
          />
          <p className="text-[14px] text-slate-600 leading-relaxed select-none">
            Declaro que todas as informações acima são verdadeiras e estou ciente de que a Horizon Bank poderá realizar verificações adicionais conforme nossa{' '}
            <a href="#" className="font-semibold text-[#003399] hover:underline" onClick={(e) => e.stopPropagation()}>
              Política de Privacidade
            </a>
            .
          </p>
        </label>
      </div>

      {partialFailureMessage ? (
        <p className="mt-5 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-[14px] text-yellow-800">{partialFailureMessage}</p>
      ) : null}

      {submitError ? (
        <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-700">{submitError}</p>
      ) : null}

      <div className="mt-10 flex flex-col-reverse gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex w-full sm:w-[140px] items-center justify-center rounded-md border border-slate-300 px-4 py-3.5 text-[15px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !acceptedTerms}
          className="inline-flex w-full sm:flex-1 items-center justify-center rounded-md bg-[#003399] px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#002266] disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {isSubmitting ? 'Enviando...' : 'Finalizar Cadastro'}
        </button>
      </div>

      <div className="mt-12 flex flex-col items-center justify-center gap-3 pb-8">
        <div className="flex items-center gap-2 text-slate-500">
          <Lock className="h-4 w-4" />
          <span className="text-[13px] font-medium">Ambiente 100% Seguro</span>
        </div>
        {/* Placeholder for the AES/Security badge from the layout */}
        <div className="h-8 w-8 rounded bg-slate-300 flex items-center justify-center text-[10px] text-white font-bold opacity-80">
          AES
        </div>
      </div>
    </div>
  )
}
