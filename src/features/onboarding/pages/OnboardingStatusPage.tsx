import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'

import { AppLayout } from '../../../components/layout/AppLayout'
import {
  getOnboardingAuditLogs,
  getOnboardingByExternalId,
  getOnboardingDocuments,
  searchOnboardingsByCpf,
} from '../api/onboardingApi'
import type { OnboardingItem, OnboardingStatus } from '../types/onboarding.types'
import { maskCpf, resolveLookupInput } from '../utils/lookupUtils'

type BackendErrorResponse = {
  message?: string
  detail?: string
}

type LookupOutcome =
  | { kind: 'found'; onboarding: OnboardingItem }
  | { kind: 'not_found' }

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Em análise',
  ADDRESS_VALIDATED: 'Endereço validado',
  DOCUMENTS_PENDING: 'Documentos pendentes',
  DOCUMENTS_RECEIVED: 'Documentos recebidos',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
}

function getStatusLabel(status: OnboardingStatus) {
  return STATUS_LABELS[status] ?? 'Status indisponível'
}

function getStatusBadgeClass(status: OnboardingStatus) {
  switch (status) {
    case 'APPROVED':
      return 'border-green-200 bg-green-50 text-green-800'
    case 'REJECTED':
      return 'border-red-200 bg-red-50 text-red-700'
    case 'DOCUMENTS_PENDING':
      return 'border-yellow-200 bg-yellow-50 text-yellow-800'
    case 'DOCUMENTS_RECEIVED':
      return 'border-blue-200 bg-blue-50 text-blue-800'
    case 'ADDRESS_VALIDATED':
      return 'border-cyan-200 bg-cyan-50 text-cyan-800'
    default:
      return 'border-slate-200 bg-slate-100 text-slate-700'
  }
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as BackendErrorResponse | undefined
    return data?.message ?? data?.detail ?? fallbackMessage
  }

  return fallbackMessage
}

export function OnboardingStatusPage() {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [lookupResult, setLookupResult] = useState<LookupOutcome | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const onboarding = lookupResult?.kind === 'found' ? lookupResult.onboarding : null
  const onboardingExternalId = onboarding?.externalId ?? null

  const lookupMutation = useMutation({
    mutationFn: async (value: string): Promise<LookupOutcome> => {
      const resolution = resolveLookupInput(value)

      if (resolution.mode === null) {
        throw new Error(resolution.error)
      }

      if (resolution.mode === 'externalId') {
        try {
          const item = await getOnboardingByExternalId(resolution.value)
          return { kind: 'found', onboarding: item }
        } catch (error) {
          if (error instanceof AxiosError && error.response?.status === 404) {
            return { kind: 'not_found' }
          }
          throw error
        }
      }

      const response = await searchOnboardingsByCpf(resolution.value)
      const item = response.content?.[0]

      if (!item) {
        return { kind: 'not_found' }
      }

      return { kind: 'found', onboarding: item }
    },
    onMutate: () => {
      setValidationError(null)
      setLookupError(null)
      setLookupResult(null)
      setDetailsOpen(false)
    },
    onSuccess: (result) => {
      setLookupResult(result)
    },
    onError: (error) => {
      if (error instanceof Error && error.message) {
        setValidationError(error.message)
        return
      }
      setLookupError(getErrorMessage(error, 'Não foi possível consultar o cadastro. Tente novamente.'))
    },
  })

  const documentsQuery = useQuery({
    queryKey: ['onboarding-documents', onboardingExternalId],
    queryFn: () => getOnboardingDocuments(onboardingExternalId as string),
    enabled: detailsOpen && Boolean(onboardingExternalId),
  })

  const auditLogsQuery = useQuery({
    queryKey: ['onboarding-audit-logs', onboardingExternalId],
    queryFn: () => getOnboardingAuditLogs(onboardingExternalId as string),
    enabled: detailsOpen && Boolean(onboardingExternalId),
  })

  const detailsLoading = documentsQuery.isLoading || auditLogsQuery.isLoading
  const detailsError = useMemo(() => {
    const hasError = documentsQuery.isError || auditLogsQuery.isError
    if (!hasError) {
      return null
    }
    return 'Não foi possível carregar todos os detalhes neste momento.'
  }, [auditLogsQuery.isError, documentsQuery.isError])

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await lookupMutation.mutateAsync(searchValue)
  }

  return (
    <AppLayout>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mx-auto w-full max-w-xl">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-slate-900">Consultar cadastro</h1>
            <p className="mt-2 text-sm text-slate-600">Acompanhe o status da sua abertura de conta.</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor="lookup" className="block text-sm font-medium text-slate-700">
                CPF ou ID do cadastro
              </label>
              <input
                id="lookup"
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Digite seu CPF ou ID"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                autoComplete="off"
              />
            </div>

            {validationError ? <p className="text-sm text-red-600">{validationError}</p> : null}
            {lookupError ? <p className="text-sm text-red-600">{lookupError}</p> : null}

            <button
              type="submit"
              disabled={lookupMutation.isPending}
              className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {lookupMutation.isPending ? 'Buscando cadastro...' : 'Buscar'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Voltar
            </button>
          </form>

          {!lookupMutation.isPending && !lookupResult && !validationError && !lookupError ? (
            <p className="mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              Informe seu CPF ou ID para consultar seu cadastro.
            </p>
          ) : null}

          {lookupResult?.kind === 'not_found' ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-base font-semibold text-slate-900">Cadastro não encontrado</p>
              <p className="mt-1 text-sm text-slate-600">Verifique os dados informados e tente novamente.</p>
            </div>
          ) : null}

          {onboarding ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Nome</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{onboarding.fullName ?? '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">CPF</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{maskCpf(onboarding.cpf ?? '')}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                  <span
                    className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(
                      onboarding.status,
                    )}`}
                  >
                    {getStatusLabel(onboarding.status)}
                  </span>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Data de criação</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{formatDate(onboarding.createdAt)}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailsOpen((previousValue) => !previousValue)}
                className="mt-5 inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {detailsOpen ? 'Ocultar detalhes' : 'Ver detalhes'}
              </button>

              {detailsOpen ? (
                <div className="mt-5 space-y-5 border-t border-slate-200 pt-5">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Dados pessoais</h2>
                    <p className="mt-1 text-sm text-slate-700">Nome: {onboarding.fullName ?? '-'}</p>
                    <p className="text-sm text-slate-700">CPF: {maskCpf(onboarding.cpf ?? '')}</p>
                    <p className="text-sm text-slate-700">ID: {onboarding.externalId}</p>
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Contatos</h2>
                    {onboarding.emails?.length ? (
                      <ul className="mt-1 space-y-1 text-sm text-slate-700">
                        {onboarding.emails.map((item, index) => (
                          <li key={`${item.email}-${index}`}>E-mail: {item.email}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-sm text-slate-600">Nenhum contato encontrado.</p>
                    )}
                    {onboarding.phones?.length ? (
                      <ul className="mt-2 space-y-1 text-sm text-slate-700">
                        {onboarding.phones.map((item, index) => (
                          <li key={`${item.phoneNumber}-${index}`}>Telefone: {item.phoneNumber}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Endereços</h2>
                    {onboarding.addresses?.length ? (
                      <ul className="mt-1 space-y-1 text-sm text-slate-700">
                        {onboarding.addresses.map((item, index) => (
                          <li key={`${item.zipCode}-${item.number}-${index}`}>
                            CEP: {item.zipCode} | Número: {item.number}
                            {item.complement ? ` | Complemento: ${item.complement}` : ''}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-sm text-slate-600">Nenhum endereço encontrado.</p>
                    )}
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Documentos</h2>
                    {detailsLoading ? <p className="mt-1 text-sm text-slate-600">Carregando detalhes...</p> : null}
                    {detailsError ? <p className="mt-1 text-sm text-red-600">{detailsError}</p> : null}
                    {!detailsLoading && !documentsQuery.data?.length ? (
                      <p className="mt-1 text-sm text-slate-600">Nenhum documento encontrado.</p>
                    ) : null}
                    {documentsQuery.data?.length ? (
                      <ul className="mt-1 space-y-1 text-sm text-slate-700">
                        {documentsQuery.data.map((item, index) => (
                          <li key={`${item.id ?? item.documentType ?? 'document'}-${index}`}>
                            Tipo: {item.documentType ?? 'Não informado'}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Auditoria</h2>
                    {!detailsLoading && !auditLogsQuery.data?.length ? (
                      <p className="mt-1 text-sm text-slate-600">Nenhum registro de auditoria encontrado.</p>
                    ) : null}
                    {auditLogsQuery.data?.length ? (
                      <ul className="mt-1 space-y-1 text-sm text-slate-700">
                        {auditLogsQuery.data.map((item, index) => (
                          <li key={`${item.id ?? item.action ?? 'audit-log'}-${index}`}>
                            {item.action ?? 'Atualização'} {item.createdAt ? `em ${formatDate(item.createdAt)}` : ''}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </AppLayout>
  )
}
