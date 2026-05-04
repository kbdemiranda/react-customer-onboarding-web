import type { ReactNode } from 'react'

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto w-full max-w-2xl space-y-8">{children}</div>
    </main>
  )
}
