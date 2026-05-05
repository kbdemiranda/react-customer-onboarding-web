import { Landmark, Search, UserPlus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { AppLayout } from '../../../components/layout/AppLayout'

export function HomePage() {
  const navigate = useNavigate()

  return (
    <AppLayout>
      <section className="w-full max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#003399]/5" aria-hidden="true" />
          <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-slate-100" aria-hidden="true" />

          <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#003399]/20 bg-[#003399]/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#003399]">
              <Landmark className="h-4 w-4" />
              Horizon Bank
            </div>

            <h1 className="mt-6 text-3xl font-bold text-[#0F172A] sm:text-4xl">Bem-vindo ao Onboarding</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600 sm:text-lg">
              Inicie sua jornada com segurança e praticidade. Escolha a opção desejada para começar.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate('/onboarding')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#003399] px-5 py-4 text-base font-semibold text-white transition hover:bg-[#002b80] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003399] focus-visible:ring-offset-2"
              >
                <UserPlus className="h-5 w-5" />
                Abertura de Conta
              </button>

              <button
                type="button"
                onClick={() => navigate('/onboarding/status')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-4 text-base font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
              >
                <Search className="h-5 w-5" />
                Consultar status de abertura
              </button>
            </div>
          </div>
        </div>
      </section>
    </AppLayout>
  )
}
