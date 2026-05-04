import type { ContactSchema, EmailSchema, PhoneSchema } from '../schemas/contactSchema'
import type { PersonalDataSchema } from '../schemas/personalDataSchema'

export type PersonalDataFormData = PersonalDataSchema
export type EmailInput = EmailSchema
export type PhoneInput = PhoneSchema
export type ContactFormData = ContactSchema
