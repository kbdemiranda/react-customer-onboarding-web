import type { AddressFormData, ContactFormData, PersonalDataFormData } from '../types/onboarding.types'

function normalizeDigits(value: string) {
  return value.replace(/\D/g, '')
}

export type CreateOnboardingPayload = {
  fullName: string
  cpf: string
  emails: Array<{
    email: string
    primaryEmail: boolean
  }>
  phones: Array<{
    phoneNumber: string
    primaryPhone: boolean
  }>
  addresses: Array<{
    zipCode: string
    number: string
    complement?: string
    primaryAddress: boolean
  }>
}

export function mapToCreateOnboardingPayload(
  personalData: PersonalDataFormData,
  contactData: ContactFormData,
  addressData: AddressFormData,
): CreateOnboardingPayload {
  return {
    fullName: personalData.fullName.trim(),
    cpf: normalizeDigits(personalData.cpf),
    emails: contactData.emails.map((item) => ({
      email: item.email.trim(),
      primaryEmail: item.primaryEmail,
    })),
    phones: contactData.phones.map((item) => ({
      phoneNumber: normalizeDigits(item.phoneNumber),
      primaryPhone: item.primaryPhone,
    })),
    addresses: addressData.addresses.map((item) => ({
      zipCode: normalizeDigits(item.zipCode),
      number: item.number.trim(),
      complement: item.complement?.trim() || undefined,
      primaryAddress: item.primaryAddress,
    })),
  }
}
