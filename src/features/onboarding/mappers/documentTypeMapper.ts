import type { DocumentType } from '../types/onboarding.types'

export type IdentityType = 'RG' | 'CNH'

export function mapIdentityTypeToDocumentType(identityType: IdentityType): Extract<DocumentType, 'IDENTITY_REGISTER' | 'DRIVER_LICENSE'> {
  return identityType === 'CNH' ? 'DRIVER_LICENSE' : 'IDENTITY_REGISTER'
}

