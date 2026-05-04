import { OnboardingLayout } from '../components/OnboardingLayout'

export function OnboardingPage() {
  return (
    <OnboardingLayout currentStep={1}>
      <h1 className="text-center text-lg font-medium text-slate-700 sm:text-xl">Etapa em construção</h1>
    </OnboardingLayout>
  )
}
