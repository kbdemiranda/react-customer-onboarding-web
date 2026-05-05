import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'

import { createOnboarding, uploadDocument } from '../api/onboardingApi'
import { mapToCreateOnboardingPayload } from '../api/onboardingPayloadMapper'
import { AddressStep } from '../components/AddressStep'
import { ContactStep } from '../components/ContactStep'
import { DocumentsStep } from '../components/DocumentsStep'
import { OnboardingLayout } from '../components/OnboardingLayout'
import { PersonalDataStep } from '../components/PersonalDataStep'
import { ReviewStep } from '../components/ReviewStep'
import type { AddressFormData, ContactFormData, DocumentFormData, DocumentType, PersonalDataFormData } from '../types/onboarding.types'

type BackendErrorResponse = {
  message?: string
  detail?: string
}

type SubmissionResult = {
  externalId: string
  partialFailureMessage?: string
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof AxiosError) {
    if (error.code === 'ERR_NETWORK' || !error.response) {
      return 'Não foi possível conectar ao servidor.'
    }

    const data = error.response?.data as BackendErrorResponse | undefined
    return data?.message ?? data?.detail ?? fallbackMessage
  }

  return fallbackMessage
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [personalData, setPersonalData] = useState<PersonalDataFormData | null>(null)
  const [contactData, setContactData] = useState<ContactFormData | null>(null)
  const [addressData, setAddressData] = useState<AddressFormData | null>(null)
  const [documentData, setDocumentData] = useState<DocumentFormData | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null)

  const createOnboardingMutation = useMutation({
    mutationFn: createOnboarding,
  })

  const uploadDocumentMutation = useMutation({
    mutationFn: ({ externalId, documentType, file, isDigital }: { externalId: string; documentType: DocumentType; file: File; isDigital?: boolean }) =>
      uploadDocument(externalId, documentType, file, isDigital),
  })

  const isSubmitting = createOnboardingMutation.isPending || uploadDocumentMutation.isPending

  const handlePersonalDataSubmit = (data: PersonalDataFormData) => {
    setPersonalData(data)
    setCurrentStep(1)
  }

  const handleContactSubmit = (data: ContactFormData) => {
    setContactData(data)
    setCurrentStep(2)
  }

  const handleAddressSubmit = (data: AddressFormData) => {
    setAddressData(data)
    setCurrentStep(3)
  }

  const handleDocumentsSubmit = (data: DocumentFormData) => {
    setDocumentData(data)
    setCurrentStep(4)
  }

  const handleReviewSubmit = async () => {
    if (!personalData || !contactData || !addressData || !documentData) {
      setSubmitError('Não foi possível enviar. Revise os dados informados.')
      return
    }

    setSubmitError(null)

    try {
      const payload = mapToCreateOnboardingPayload(personalData, contactData, addressData)
      const createResponse = await createOnboardingMutation.mutateAsync(payload)

      if (!createResponse.externalId) {
        throw new Error('Protocolo não retornado pela API')
      }

      let failedUploads = 0

      for (const documentItem of documentData.documents) {
        try {
          await uploadDocumentMutation.mutateAsync({
            externalId: createResponse.externalId,
            documentType: documentItem.documentType,
            file: documentItem.file,
            isDigital: documentItem.documentType === 'DRIVER_LICENSE' ? Boolean(documentData.cnhDigital) : undefined,
          })
        } catch {
          failedUploads += 1
        }
      }

      if (failedUploads > 0) {
        setSubmissionResult({
          externalId: createResponse.externalId,
          partialFailureMessage:
            'Seu cadastro foi criado, mas um ou mais documentos não puderam ser enviados. Você pode acompanhar com o protocolo.',
        })
        return
      }

      setSubmissionResult({
        externalId: createResponse.externalId,
      })
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Não foi possível enviar o cadastro. Tente novamente.'))
    }
  }

  const handleBackToPersonalData = () => {
    setCurrentStep(0)
  }

  const handleBackToContact = () => {
    setCurrentStep(1)
  }

  const handleBackToAddress = () => {
    setCurrentStep(2)
  }

  const handleBackToDocuments = () => {
    setCurrentStep(3)
  }

  const hasStartedOnboarding = Boolean(personalData || contactData || addressData || documentData || currentStep > 0)

  const handleStatusNavigation = () => {
    if (hasStartedOnboarding) {
      const shouldLeave = window.confirm(
        'Se você sair agora para consultar status, será necessário reiniciar o onboarding do zero. Deseja continuar?',
      )

      if (!shouldLeave) {
        return
      }
    }

    navigate('/onboarding/status')
  }

  return (
    <OnboardingLayout currentStep={Math.min(currentStep + 1, 5)} onStatusClick={handleStatusNavigation}>
      {currentStep === 0 ? (
        <PersonalDataStep
          defaultValues={personalData ?? undefined}
          onBack={() => navigate('/')}
          onSubmit={handlePersonalDataSubmit}
        />
      ) : null}

      {currentStep === 1 ? (
        <ContactStep
          defaultValues={contactData ?? undefined}
          onBack={handleBackToPersonalData}
          onSubmit={handleContactSubmit}
        />
      ) : null}

      {currentStep === 2 ? (
        <AddressStep
          defaultValues={addressData ?? undefined}
          onBack={handleBackToContact}
          onSubmit={handleAddressSubmit}
        />
      ) : null}

      {currentStep === 3 ? (
        <DocumentsStep
          defaultValues={documentData ?? undefined}
          onBack={handleBackToAddress}
          onSubmit={handleDocumentsSubmit}
        />
      ) : null}

      {currentStep === 4 && submissionResult ? (
        <div className="mx-auto w-full max-w-xl text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Cadastro enviado com sucesso</h1>
          <p className="mt-2 text-sm text-slate-600">Sua solicitação de abertura de conta foi recebida.</p>

          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 text-left">
            <p className="text-sm text-green-800">Protocolo</p>
            <p className="text-lg font-semibold text-green-900">{submissionResult.externalId}</p>
          </div>

          {submissionResult.partialFailureMessage ? (
            <p className="mt-4 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              {submissionResult.partialFailureMessage}
            </p>
          ) : null}

          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate('/onboarding/status')}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Consultar cadastro
            </button>
          </div>
        </div>
      ) : null}

      {currentStep === 4 && !submissionResult && personalData && contactData && addressData && documentData ? (
        <ReviewStep
          personalData={personalData}
          contactData={contactData}
          addressData={addressData}
          documentData={documentData}
          isSubmitting={isSubmitting}
          submitError={submitError}
          onBack={handleBackToDocuments}
          onSubmit={handleReviewSubmit}
          onEditStep={setCurrentStep}
        />
      ) : null}
    </OnboardingLayout>
  )
}
