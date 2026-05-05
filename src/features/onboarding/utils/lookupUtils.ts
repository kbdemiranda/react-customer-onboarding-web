export type LookupMode = 'externalId' | 'cpf'

export type LookupResolution =
  | {
      mode: LookupMode
      value: string
    }
  | {
      mode: null
      value: null
      error: string
    }

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function normalizeCpf(value: string) {
  return value.replace(/\D/g, '')
}

export function isUuid(value: string) {
  return UUID_REGEX.test(value.trim())
}

export function isValidCpf(value: string) {
  return /^\d{11}$/.test(normalizeCpf(value))
}

export function resolveLookupInput(rawValue: string): LookupResolution {
  const trimmedValue = rawValue.trim()

  if (!trimmedValue) {
    return {
      mode: null,
      value: null,
      error: 'Informe um CPF ou ID válido para continuar.',
    }
  }

  if (isUuid(trimmedValue)) {
    return {
      mode: 'externalId',
      value: trimmedValue,
    }
  }

  const normalizedCpf = normalizeCpf(trimmedValue)

  if (isValidCpf(normalizedCpf)) {
    return {
      mode: 'cpf',
      value: normalizedCpf,
    }
  }

  return {
    mode: null,
    value: null,
    error: 'CPF ou ID inválido. Verifique os dados e tente novamente.',
  }
}

export function maskCpf(value: string) {
  const digits = normalizeCpf(value).slice(0, 11)

  if (digits.length !== 11) {
    return value
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}
