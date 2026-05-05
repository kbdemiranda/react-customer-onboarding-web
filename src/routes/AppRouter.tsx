import { Route, Routes } from 'react-router-dom'

import { HomePage } from '../features/home/pages/HomePage'
import { OnboardingPage } from '../features/onboarding/pages/OnboardingPage'
import { OnboardingStatusPage } from '../features/onboarding/pages/OnboardingStatusPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/onboarding/status" element={<OnboardingStatusPage />} />
    </Routes>
  )
}
