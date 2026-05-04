export type OnboardingStepperProps = {
  steps: string[]
  currentStep: number
}

export function OnboardingStepper({ steps, currentStep }: OnboardingStepperProps) {
  return (
    <section aria-label="Etapas do onboarding" className="overflow-x-auto pb-1">
      <ol className="flex min-w-max items-start gap-3 sm:gap-4">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isActive = isCompleted || isCurrent
          const connectorActive = stepNumber < currentStep

          return (
            <li key={step} className="flex items-center gap-3">
              <div className="flex min-w-[94px] flex-col items-center gap-2 text-center sm:min-w-[108px]">
                <span
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold transition-colors',
                    isActive
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 bg-white text-slate-500',
                  ].join(' ')}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {stepNumber}
                </span>
                <span
                  className={[
                    'text-xs font-medium sm:text-sm',
                    isActive ? 'text-slate-900' : 'text-slate-500',
                  ].join(' ')}
                >
                  {step}
                </span>
              </div>

              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className={[
                    'mb-6 block h-px w-8 rounded-full sm:w-10',
                    connectorActive ? 'bg-blue-600' : 'bg-slate-300',
                  ].join(' ')}
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
