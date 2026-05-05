import type { ReactNode } from 'react'
import { Lock, Shield, ShieldCheck } from 'lucide-react'

import { AppLayout } from '../../../components/layout/AppLayout'
import { OnboardingStepper } from './OnboardingStepper'

export type OnboardingLayoutProps = {
  children: ReactNode
  currentStep: number
  onStatusClick?: () => void
}

const ONBOARDING_STEPS = ['Dados', 'Contato', 'Endereço', 'Docs', 'Fim']

export function OnboardingLayout({ children, currentStep, onStatusClick }: OnboardingLayoutProps) {
  return (
    <AppLayout onStatusClick={onStatusClick}>
      <div className="w-full max-w-[760px] space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-[#0F172A] sm:text-[32px]">Abra sua conta</h1>
          <p className="text-[17px] text-slate-600">
            Comece sua jornada financeira com segurança e praticidade.
          </p>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="px-6 pt-8 pb-4 sm:px-12">
            <OnboardingStepper steps={ONBOARDING_STEPS} currentStep={currentStep} />
          </div>
          <hr className="border-slate-100" />
          <div className="px-6 py-8 sm:px-12 sm:py-10">
            {children}
          </div>
        </section>

        <div className="flex justify-center gap-12 sm:gap-32 pt-6 pb-4">
          <div className="flex flex-col items-center gap-3 text-slate-400">
             <Lock className="h-6 w-6 stroke-[1.5]" />
             <span className="text-[11px] font-semibold tracking-[0.15em]">CRIPTOGRAFADO</span>
          </div>
          <div className="flex flex-col items-center gap-3 text-slate-400">
             <Shield className="h-6 w-6 stroke-[1.5]" />
             <span className="text-[11px] font-semibold tracking-[0.15em]">PROTEGIDO</span>
          </div>
          <div className="flex flex-col items-center gap-3 text-slate-400">
             <ShieldCheck className="h-6 w-6 stroke-[1.5]" />
             <span className="text-[11px] font-semibold tracking-[0.15em]">VERIFICADO</span>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
