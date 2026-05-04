import type { ReactNode } from 'react'

import { AppLayout } from '../../../components/layout/AppLayout'
import { Header } from '../../../components/layout/Header'
import { OnboardingStepper } from './OnboardingStepper'

export type OnboardingLayoutProps = {
  children: ReactNode
  currentStep: number
}

const ONBOARDING_STEPS = ['Dados pessoais', 'Contato', 'Endereço', 'Documentos', 'Revisão']

export function OnboardingLayout({ children, currentStep }: OnboardingLayoutProps) {
  return (
    <AppLayout>
      <Header />
      <OnboardingStepper steps={ONBOARDING_STEPS} currentStep={currentStep} />
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">{children}</section>
    </AppLayout>
  )
}
