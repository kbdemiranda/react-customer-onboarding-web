import { describe, expect, it } from 'vitest'

import { mapIdentityTypeToDocumentType } from './documentTypeMapper'

describe('mapIdentityTypeToDocumentType', () => {
  it('maps CNH to DRIVER_LICENSE', () => {
    expect(mapIdentityTypeToDocumentType('CNH')).toBe('DRIVER_LICENSE')
  })

  it('maps RG to IDENTITY_REGISTER', () => {
    expect(mapIdentityTypeToDocumentType('RG')).toBe('IDENTITY_REGISTER')
  })
})
