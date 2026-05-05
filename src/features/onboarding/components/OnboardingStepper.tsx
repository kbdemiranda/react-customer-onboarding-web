export type OnboardingStepperProps = {
  steps: string[]
  currentStep: number
}

export function OnboardingStepper({ steps, currentStep }: OnboardingStepperProps) {
  return (
    <div aria-label="Etapas do onboarding" className="w-full">
      <ol className="flex w-full items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isActive = isCompleted || isCurrent
          const connectorActive = stepNumber < currentStep

          return (
            <li key={step} className={`flex items-center ${index < steps.length - 1 ? 'w-full' : ''}`}>
              <div className="relative flex flex-col items-center group">
                <span
                  className={[
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-[13px] font-semibold transition-colors',
                    isActive
                      ? 'border-[#003399] bg-[#003399] text-white'
                      : 'border-slate-200 bg-white text-slate-400',
                  ].join(' ')}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {stepNumber}
                </span>
                <span
                  className={[
                    'absolute top-10 whitespace-nowrap text-[13px] font-medium',
                    isActive ? 'text-[#003399]' : 'text-slate-400',
                  ].join(' ')}
                >
                  {step}
                </span>
              </div>

              {index < steps.length - 1 ? (
                <div
                  aria-hidden="true"
                  className={[
                    'h-[2px] w-full flex-1 mx-2',
                    connectorActive ? 'bg-[#003399]' : 'bg-slate-200',
                  ].join(' ')}
                />
              ) : null}
            </li>
          )
        })}
      </ol>
      {/* We add a spacer to accommodate the absolute text below the circles */}
      <div className="h-6" />
    </div>
  )
}
