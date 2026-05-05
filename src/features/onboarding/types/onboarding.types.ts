import type { AddressItemSchema, AddressSchema } from '../schemas/addressSchema'
import type { ContactSchema, EmailSchema, PhoneSchema } from '../schemas/contactSchema'
import type { DocumentItemSchema, DocumentSchema } from '../schemas/documentSchema'
import type { PersonalDataSchema } from '../schemas/personalDataSchema'

export type PersonalDataFormData = PersonalDataSchema
export type EmailInput = EmailSchema
export type PhoneInput = PhoneSchema
export type ContactFormData = ContactSchema
export type AddressInput = AddressItemSchema
export type AddressFormData = AddressSchema
export type DocumentType =
  | 'CPF'
  | 'IDENTITY_REGISTER'
  | 'DRIVER_LICENSE'
  | 'PASSPORT'
  | 'PROOF_OF_ADDRESS'
export type DocumentInput = DocumentItemSchema
export type DocumentFormData = DocumentSchema

export type OnboardingStatus =
  | 'PENDING'
  | 'ADDRESS_VALIDATED'
  | 'DOCUMENTS_PENDING'
  | 'DOCUMENTS_RECEIVED'
  | 'APPROVED'
  | 'REJECTED'
  | (string & {})

export type OnboardingEmail = {
  email: string
  primaryEmail?: boolean
}

export type OnboardingPhone = {
  phoneNumber: string
  primaryPhone?: boolean
}

export type OnboardingAddress = {
  zipCode: string
  number: string
  complement?: string | null
  primaryAddress?: boolean
}

export type OnboardingItem = {
  externalId: string
  fullName: string
  cpf: string
  status: OnboardingStatus
  createdAt: string
  emails?: OnboardingEmail[]
  phones?: OnboardingPhone[]
  addresses?: OnboardingAddress[]
}

export type OnboardingsSearchResponse = {
  content: OnboardingItem[]
}

export type OnboardingDocument = {
  id?: string
  documentType?: DocumentType | string
  createdAt?: string
}

export type OnboardingAuditLog = {
  id?: string
  action?: string
  description?: string
  createdAt?: string
}
