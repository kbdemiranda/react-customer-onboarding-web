import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { useNavigate } from 'react-router-dom'

import { AppLayout } from '../../../components/layout/AppLayout'
import {
  getOnboardingByProtocol,
  getOnboardingDocuments,
  searchOnboardingsByCpf,
} from '../api/onboardingApi'
import type { DocumentType, OnboardingAddress, OnboardingItem, OnboardingStatus } from '../types/onboarding.types'
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

const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CPF: 'CPF',
  IDENTITY_REGISTER: 'RG',
  DRIVER_LICENSE: 'CNH',
  PASSPORT: 'Passaporte',
  PROOF_OF_ADDRESS: 'Comprovante de residência',
}

function getStatusLabel(status: OnboardingStatus) {
  return STATUS_LABELS[status] ?? 'Status indisponível'
}

function getDocumentTypeLabel(documentType: string) {
  const label = DOCUMENT_TYPE_LABELS[documentType as DocumentType]
  if (!label) {
    return documentType
  }
  return label
}

function formatFullAddress(address: OnboardingAddress) {
  const firstLine = [address.street, address.number, address.complement].filter(Boolean).join(', ')
  const cityAndState = [address.city, address.state].filter(Boolean).join('/')
  const secondLine = [address.neighborhood, cityAndState].filter(Boolean).join(' - ')
  const postalLine = address.zipCode ? `CEP ${address.zipCode}` : ''

  return [firstLine, secondLine, postalLine].filter(Boolean).join(' | ') || 'Endereço não informado'
}

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <div className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">{value}</div>
    </div>
  )
}

function ReadonlyGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
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

      if (resolution.mode === 'cpf') {
        const response = await searchOnboardingsByCpf(resolution.value)
        const item = response.content?.[0]
        if (!item) {
          return { kind: 'not_found' }
        }
        return { kind: 'found', onboarding: item }
      }

      try {
        const item = await getOnboardingByProtocol(resolution.value)
        return { kind: 'found', onboarding: item }
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 404) {
          return { kind: 'not_found' }
        }
        throw error
      }
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

  const detailsLoading = documentsQuery.isLoading
  const detailsError = useMemo(() => {
    if (!documentsQuery.isError) {
      return null
    }
    return 'Não foi possível carregar todos os detalhes neste momento.'
  }, [documentsQuery.isError])

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
                CPF ou Protocolo
              </label>
              <input
                id="lookup"
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value.replace(/\D/g, '').slice(0, 14))}
                placeholder="Digite aqui o protocolo ou CPF"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                autoComplete="off"
                inputMode="numeric"
                maxLength={14}
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
              Informe seu CPF ou protocolo para consultar seu cadastro.
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
                  <p className="text-xs uppercase tracking-wide text-slate-500">Protocolo</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{onboarding.protocol ?? '-'}</p>
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
                <div className="mt-5 space-y-4 border-t border-slate-200 pt-5">
                  <ReadonlyGroup title="Dados pessoais">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ReadonlyField label="Nome" value={onboarding.fullName ?? '-'} />
                      <ReadonlyField label="CPF" value={maskCpf(onboarding.cpf ?? '')} />
                      <ReadonlyField label="Protocolo" value={onboarding.protocol ?? '-'} />
                    </div>
                  </ReadonlyGroup>

                  <ReadonlyGroup title="Contatos">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {onboarding.emails?.length ? (
                        onboarding.emails.map((item, index) => (
                          <ReadonlyField
                            key={`${item.email}-${index}`}
                            label={onboarding.emails && onboarding.emails.length > 1 ? `E-mail ${index + 1}` : 'E-mail'}
                            value={item.email}
                          />
                        ))
                      ) : (
                        <ReadonlyField label="E-mail" value="Não informado" />
                      )}
                      {onboarding.phones?.length ? (
                        onboarding.phones.map((item, index) => (
                          <ReadonlyField
                            key={`${item.phoneNumber}-${index}`}
                            label={onboarding.phones && onboarding.phones.length > 1 ? `Telefone ${index + 1}` : 'Telefone'}
                            value={item.phoneNumber}
                          />
                        ))
                      ) : (
                        <ReadonlyField label="Telefone" value="Não informado" />
                      )}
                    </div>
                  </ReadonlyGroup>

                  <ReadonlyGroup title="Endereços">
                    <div className="space-y-3">
                      {onboarding.addresses?.length ? (
                        onboarding.addresses.map((item, index) => (
                          <ReadonlyField key={`${item.zipCode}-${item.number}-${index}`} label={`Endereço ${index + 1}`} value={formatFullAddress(item)} />
                        ))
                      ) : (
                        <ReadonlyField label="Endereço" value="Não informado" />
                      )}
                    </div>
                  </ReadonlyGroup>

                  <ReadonlyGroup title="Documentos">
                    {detailsLoading ? <p className="text-sm text-slate-600">Carregando detalhes...</p> : null}
                    {detailsError ? <p className="text-sm text-red-600">{detailsError}</p> : null}
                    {!detailsLoading && !documentsQuery.data?.length ? <ReadonlyField label="Documento" value="Nenhum documento encontrado" /> : null}
                    {documentsQuery.data?.length ? (
                      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-800">
                        {documentsQuery.data.map((item, index) => (
                          <li key={`${item.id ?? item.documentType ?? 'document'}-${index}`}>
                            {item.documentType ? getDocumentTypeLabel(item.documentType) : 'Não informado'}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </ReadonlyGroup>

                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>
    </AppLayout>
  )
}
