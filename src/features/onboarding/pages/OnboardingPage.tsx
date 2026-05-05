import { useState } from 'react'

import { AddressStep } from '../components/AddressStep'
import { ContactStep } from '../components/ContactStep'
import { DocumentsStep } from '../components/DocumentsStep'
import { OnboardingLayout } from '../components/OnboardingLayout'
import { PersonalDataStep } from '../components/PersonalDataStep'
import type { AddressFormData, ContactFormData, DocumentFormData, PersonalDataFormData } from '../types/onboarding.types'

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [personalData, setPersonalData] = useState<PersonalDataFormData | null>(null)
  const [contactData, setContactData] = useState<ContactFormData | null>(null)
  const [addressData, setAddressData] = useState<AddressFormData | null>(null)
  const [documentData, setDocumentData] = useState<DocumentFormData | null>(null)

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

  const handleBackToPersonalData = () => {
    setCurrentStep(0)
  }

  const handleBackToContact = () => {
    setCurrentStep(1)
  }

  const handleBackToAddress = () => {
    setCurrentStep(2)
  }

  return (
    <OnboardingLayout currentStep={currentStep + 1}>
      {currentStep === 0 ? (
        <PersonalDataStep defaultValues={personalData ?? undefined} onSubmit={handlePersonalDataSubmit} />
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

      {currentStep >= 4 ? (
        <div className="mx-auto w-full max-w-xl text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Revisão</h1>
          <p className="mt-2 text-sm text-slate-600">Confira os dados informados antes de concluir sua abertura de conta.</p>
        </div>
      ) : null}
    </OnboardingLayout>
  )
}
