import { describe, expect, it } from 'vitest'

import { buildDocumentUploadFormData } from './documentUploadMapper'

describe('buildDocumentUploadFormData', () => {
  it('builds multipart payload with exact documentType and optional isDigital', () => {
    const file = new File(['file-content'], 'cnh.pdf', { type: 'application/pdf' })

    const formData = buildDocumentUploadFormData({
      documentType: 'DRIVER_LICENSE',
      file,
      isDigital: true,
    })

    expect(formData.get('documentType')).toBe('DRIVER_LICENSE')
    expect(formData.get('isDigital')).toBe('true')
    expect(formData.get('file')).toBe(file)
  })

  it('does not include aliases and keeps RG as IDENTITY_REGISTER', () => {
    const file = new File(['file-content'], 'rg.jpg', { type: 'image/jpeg' })

    const formData = buildDocumentUploadFormData({
      documentType: 'IDENTITY_REGISTER',
      file,
    })

    expect(formData.get('documentType')).toBe('IDENTITY_REGISTER')
    expect(formData.get('documentType')).not.toBe('identity')
    expect(formData.get('isDigital')).toBeNull()
  })
})
