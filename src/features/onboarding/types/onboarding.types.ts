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
export type DocumentType = 'IDENTITY' | 'PROOF_OF_ADDRESS' | 'INCOME_PROOF'
export type DocumentInput = DocumentItemSchema
export type DocumentFormData = DocumentSchema
