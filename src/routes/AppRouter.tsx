import { Navigate, Route, Routes } from 'react-router-dom'

import { OnboardingPage } from '../features/onboarding/pages/OnboardingPage'
import { OnboardingStatusPage } from '../features/onboarding/pages/OnboardingStatusPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/onboarding" replace />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/onboarding/status" element={<OnboardingStatusPage />} />
    </Routes>
  )
}
