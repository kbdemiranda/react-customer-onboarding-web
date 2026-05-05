import { describe, expect, it } from 'vitest'

import { resolveLookupInput } from './lookupUtils'

describe('resolveLookupInput', () => {
  it('accepts a 14-digit protocol', () => {
    expect(resolveLookupInput('58392017463051')).toEqual({
      mode: 'protocol',
      value: '58392017463051',
    })
  })

  it('normalizes non-digit characters before validating protocol', () => {
    expect(resolveLookupInput('5839.2017-4630 51')).toEqual({
      mode: 'protocol',
      value: '58392017463051',
    })
  })

  it('returns validation error for missing identifier', () => {
    expect(resolveLookupInput('')).toEqual({
      mode: null,
      value: null,
      error: 'Informe um CPF ou protocolo válido.',
    })
  })

  it('accepts CPF with 11 digits', () => {
    expect(resolveLookupInput('12345678901')).toEqual({
      mode: 'cpf',
      value: '12345678901',
    })
  })

  it('returns validation error for invalid identifier size', () => {
    expect(resolveLookupInput('5839201746305')).toEqual({
      mode: null,
      value: null,
      error: 'Informe um CPF ou protocolo válido.',
    })
  })
})
