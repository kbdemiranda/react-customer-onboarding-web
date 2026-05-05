import type { AddressFormData, ContactFormData, DocumentFormData, DocumentType, PersonalDataFormData } from '../types/onboarding.types'

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
}

const documentTypeLabels: Record<DocumentType, string> = {
  IDENTITY: 'Documento de identificação',
  PROOF_OF_ADDRESS: 'Comprovante de endereço',
  INCOME_PROOF: 'Comprovante de renda',
}

export function ReviewStep({
  personalData,
  contactData,
  addressData,
  documentData,
  isSubmitting,
  submitError,
  partialFailureMessage,
  onBack,
  onSubmit,
}: ReviewStepProps) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Revisão</h1>
        <p className="mt-2 text-sm text-slate-600">Confira os dados informados antes de concluir sua abertura de conta.</p>
      </div>

      <div className="space-y-4">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Dados pessoais</h2>
          <p className="mt-3 text-sm text-slate-600">Nome completo</p>
          <p className="text-sm font-medium text-slate-900">{personalData.fullName}</p>
          <p className="mt-3 text-sm text-slate-600">CPF</p>
          <p className="text-sm font-medium text-slate-900">{personalData.cpf}</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Contato</h2>
          <div className="mt-3 space-y-3">
            {contactData.emails.map((item, index) => (
              <p key={`email-${index}`} className="text-sm text-slate-800">
                {item.email} {item.primaryEmail ? '(principal)' : ''}
              </p>
            ))}
            {contactData.phones.map((item, index) => (
              <p key={`phone-${index}`} className="text-sm text-slate-800">
                {item.phoneNumber} {item.primaryPhone ? '(principal)' : ''}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Endereço</h2>
          <div className="mt-3 space-y-3">
            {addressData.addresses.map((item, index) => (
              <div key={`address-${index}`} className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm text-slate-800">CEP: {item.zipCode}</p>
                <p className="text-sm text-slate-800">Número: {item.number}</p>
                <p className="text-sm text-slate-800">Complemento: {item.complement?.trim() ? item.complement : '-'}</p>
                <p className="text-sm text-slate-800">{item.primaryAddress ? 'Endereço principal' : 'Endereço adicional'}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Documentos</h2>
          <div className="mt-3 space-y-3">
            {documentData.documents.map((item, index) => (
              <div key={`document-${index}`} className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-900">{documentTypeLabels[item.documentType]}</p>
                <p className="mt-1 text-sm text-slate-700">{item.file.name}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {partialFailureMessage ? (
        <p className="mt-5 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">{partialFailureMessage}</p>
      ) : null}

      {submitError ? (
        <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p>
      ) : null}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 sm:w-auto"
        >
          {isSubmitting ? 'Enviando cadastro...' : 'Finalizar abertura de conta'}
        </button>
      </div>
    </div>
  )
}
