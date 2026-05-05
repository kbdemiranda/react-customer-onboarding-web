import { httpClient } from '../../../lib/http'
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
}

export async function createOnboarding(payload: CreateOnboardingPayload) {
  const { data } = await httpClient.post<CreateOnboardingResponse>('/api/v1/onboardings', payload)
  return data
}

export type UploadDocumentResponse = {
  id?: string
  documentType?: DocumentType
}

export async function uploadDocument(externalId: string, documentType: DocumentType, file: File) {
  const formData = new FormData()
  formData.append('documentType', documentType)
  formData.append('file', file)

  const { data } = await httpClient.post<UploadDocumentResponse>(`/api/v1/onboardings/${externalId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return data
}

export async function getOnboardingByExternalId(externalId: string) {
  const { data } = await httpClient.get<OnboardingItem>(`/api/v1/onboardings/${externalId}`)
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
