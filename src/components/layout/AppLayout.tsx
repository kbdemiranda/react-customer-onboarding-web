import type { ReactNode } from 'react'
import { Header } from './Header'

type AppLayoutProps = {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <Header />
      <main className="flex-1 px-4 py-10 sm:px-6 sm:py-12 flex flex-col items-center">
        {children}
      </main>
      <footer className="w-full border-t border-slate-200 bg-[#F8FAFC] py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 text-[13px] text-slate-500 sm:flex-row sm:gap-0">
          <div className="font-semibold text-slate-400">Horizon Bank</div>
          <div>© 2024 Horizon Bank. All rights reserved. Secured by AES-256 encryption.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-700 underline underline-offset-2">Política de Privacidade</a>
            <a href="#" className="hover:text-slate-700 underline underline-offset-2">Termos de Uso</a>
            <a href="#" className="hover:text-slate-700 underline underline-offset-2">Segurança</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
