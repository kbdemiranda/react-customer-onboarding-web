import { PersonalDataStep } from '../components/PersonalDataStep'
import { OnboardingLayout } from '../components/OnboardingLayout'
import type { PersonalDataFormData } from '../types/onboarding.types'
import { useState } from 'react'

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [personalData, setPersonalData] = useState<PersonalDataFormData | null>(null)

  const handlePersonalDataSubmit = (data: PersonalDataFormData) => {
    setPersonalData(data)
    setCurrentStep(1)
  }

  return (
    <OnboardingLayout currentStep={currentStep + 1}>
      {currentStep === 0 ? (
        <PersonalDataStep defaultValues={personalData ?? undefined} onSubmit={handlePersonalDataSubmit} />
      ) : (
        <div className="mx-auto w-full max-w-xl text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Etapa de contato</h1>
          <p className="mt-2 text-sm text-slate-600">A próxima etapa será implementada em seguida.</p>
        </div>
      )}
    </OnboardingLayout>
  )
}
