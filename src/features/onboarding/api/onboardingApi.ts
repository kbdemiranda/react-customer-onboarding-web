import { httpClient } from '../../../lib/http'
import type { DocumentType } from '../types/onboarding.types'
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
