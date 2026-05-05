import type { DocumentType } from '../types/onboarding.types'

type BuildDocumentUploadFormDataInput = {
  documentType: DocumentType
  file: File
  isDigital?: boolean
}

export function buildDocumentUploadFormData({ documentType, file, isDigital }: BuildDocumentUploadFormDataInput) {
  const formData = new FormData()
  formData.append('documentType', documentType)
  formData.append('file', file)

  if (typeof isDigital === 'boolean') {
    formData.append('isDigital', String(isDigital))
  }

  return formData
}

