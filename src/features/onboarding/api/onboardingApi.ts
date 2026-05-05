import { httpClient } from '../../../lib/http'
import { buildDocumentUploadFormData } from '../mappers/documentUploadMapper'
import type {
  DocumentType,
  OnboardingAuditLog,
  OnboardingDocument,
  OnboardingItem,
  OnboardingsSearchResponse,
} from '../types/onboarding.types'
import type { CreateOnboardingPayload } from './onboardingPayloadMapper'

export type CreateOnboardingResponse = {
  externalId: string
  protocol?: string
}

export async function createOnboarding(payload: CreateOnboardingPayload) {
  const { data } = await httpClient.post<CreateOnboardingResponse>('/api/v1/onboardings', payload)
  return data
}

export type UploadDocumentResponse = {
  id?: string
  documentType?: DocumentType
}

type ZipCodeLookupResponse = {
  zipCode?: string | null
  cep?: string | null
  street?: string | null
  logradouro?: string | null
  neighborhood?: string | null
  bairro?: string | null
  city?: string | null
  localidade?: string | null
  state?: string | null
  uf?: string | null
}

export type ZipCodeLookupResult = {
  zipCode?: string
  street?: string
  neighborhood?: string
  city?: string
  state?: string
}

function normalizeDigits(value: string) {
  return value.replace(/\D/g, '')
}

function toOptionalText(value: string | null | undefined) {
  const text = value?.trim()
  return text ? text : undefined
}

export async function searchZipCode(zipCode: string): Promise<ZipCodeLookupResult> {
  const sanitizedZipCode = normalizeDigits(zipCode)
  const { data } = await httpClient.get<ZipCodeLookupResponse>(`/api/v1/zip-codes/${sanitizedZipCode}`)

  return {
    zipCode: toOptionalText(data.zipCode) ?? toOptionalText(data.cep),
    street: toOptionalText(data.street) ?? toOptionalText(data.logradouro),
    neighborhood: toOptionalText(data.neighborhood) ?? toOptionalText(data.bairro),
    city: toOptionalText(data.city) ?? toOptionalText(data.localidade),
    state: toOptionalText(data.state) ?? toOptionalText(data.uf),
  }
}

export async function uploadDocument(externalId: string, documentType: DocumentType, file: File, isDigital?: boolean) {
  const formData = buildDocumentUploadFormData({ documentType, file, isDigital })

  const { data } = await httpClient.post<UploadDocumentResponse>(`/api/v1/onboardings/${externalId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return data
}

export async function getOnboardingByProtocol(protocol: string) {
  const { data } = await httpClient.get<OnboardingItem>(`/api/v1/onboardings/protocol/${protocol}`)
  return data
}

export async function searchOnboardingsByCpf(cpf: string) {
  const { data } = await httpClient.get<OnboardingsSearchResponse>('/api/v1/onboardings', {
    params: {
      cpf,
      page: 0,
      size: 1,
    },
  })
  return data
}

export async function getOnboardingDocuments(externalId: string) {
  const { data } = await httpClient.get<OnboardingDocument[]>(`/api/v1/onboardings/${externalId}/documents`)
  return data
}

export async function getOnboardingAuditLogs(externalId: string) {
  const { data } = await httpClient.get<OnboardingAuditLog[]>(`/api/v1/onboardings/${externalId}/audit-logs`)
  return data
}
