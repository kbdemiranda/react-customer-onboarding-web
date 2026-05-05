export type LookupMode = 'protocol' | 'cpf'

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

const PROTOCOL_REGEX = /^\d{14}$/

export function normalizeCpf(value: string) {
  return value.replace(/\D/g, '')
}

export function normalizeProtocol(value: string) {
  return value.replace(/\D/g, '')
}

export function isValidProtocol(value: string) {
  return PROTOCOL_REGEX.test(value.trim())
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
      error: 'Informe um CPF ou protocolo válido.',
    }
  }

  const protocol = normalizeProtocol(trimmedValue)

  if (isValidProtocol(protocol)) {
    return {
      mode: 'protocol',
      value: protocol,
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
    error: 'Informe um CPF ou protocolo válido.',
  }
}

export function maskCpf(value: string) {
  const digits = normalizeCpf(value).slice(0, 11)

  if (digits.length !== 11) {
    return value
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}
