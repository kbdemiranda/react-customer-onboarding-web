import { useState } from 'react'

import { ContactStep } from '../components/ContactStep'
import { OnboardingLayout } from '../components/OnboardingLayout'
import { PersonalDataStep } from '../components/PersonalDataStep'
import type { ContactFormData, PersonalDataFormData } from '../types/onboarding.types'

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [personalData, setPersonalData] = useState<PersonalDataFormData | null>(null)
  const [contactData, setContactData] = useState<ContactFormData | null>(null)

  const handlePersonalDataSubmit = (data: PersonalDataFormData) => {
    setPersonalData(data)
    setCurrentStep(1)
  }

  const handleContactSubmit = (data: ContactFormData) => {
    setContactData(data)
    setCurrentStep(2)
  }

  const handleBackToPersonalData = () => {
    setCurrentStep(0)
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

      {currentStep >= 2 ? (
        <div className="mx-auto w-full max-w-xl text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Etapa de endereço</h1>
          <p className="mt-2 text-sm text-slate-600">A próxima etapa será implementada em seguida.</p>
        </div>
      ) : null}
    </OnboardingLayout>
  )
}
