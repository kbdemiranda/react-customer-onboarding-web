import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { DocumentsStep } from './DocumentsStep'

function setFile(input: Element, file: File) {
  return userEvent.upload(input as HTMLInputElement, file)
}

describe('DocumentsStep submit payload', () => {
  it('submits CNH as DRIVER_LICENSE and keeps documentType unchanged when digital toggle is enabled', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<DocumentsStep onBack={vi.fn()} onSubmit={onSubmit} />)

    await user.click(screen.getByText('CNH'))
    await user.click(screen.getByText('Minha CNH é digital'))

    const fileInputs = container.querySelectorAll('input[type="file"]')
    const cnhPdf = new File(['cnh'], 'cnh.pdf', { type: 'application/pdf' })
    const proof = new File(['proof'], 'proof.pdf', { type: 'application/pdf' })

    await setFile(fileInputs[0], cnhPdf)
    await setFile(fileInputs[1], proof)

    const submitButton = container.querySelector('button[type="submit"]')
    if (!submitButton) throw new Error('Submit button not found')
    await user.click(submitButton)

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))

    const payload = onSubmit.mock.calls[0][0]
    expect(payload.identityType).toBe('CNH')
    expect(payload.cnhDigital).toBe(true)
    expect(payload.documents[0].documentType).toBe('DRIVER_LICENSE')
    expect(payload.documents[1].documentType).toBe('PROOF_OF_ADDRESS')
  })

  it('submits RG as IDENTITY_REGISTER', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    const { container } = render(<DocumentsStep onBack={vi.fn()} onSubmit={onSubmit} />)

    const fileInputs = container.querySelectorAll('input[type="file"]')
    const front = new File(['front'], 'rg-front.jpg', { type: 'image/jpeg' })
    const back = new File(['back'], 'rg-back.jpg', { type: 'image/jpeg' })
    const proof = new File(['proof'], 'proof.pdf', { type: 'application/pdf' })

    await setFile(fileInputs[0], front)
    await setFile(fileInputs[1], back)
    await setFile(fileInputs[2], proof)

    const submitButton = container.querySelector('button[type="submit"]')
    if (!submitButton) throw new Error('Submit button not found')
    await user.click(submitButton)

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))

    const payload = onSubmit.mock.calls[0][0]
    expect(payload.identityType).toBe('RG')
    expect(payload.documents[0].documentType).toBe('IDENTITY_REGISTER')
    expect(payload.documents[1].documentType).toBe('IDENTITY_REGISTER')
    expect(payload.documents[2].documentType).toBe('PROOF_OF_ADDRESS')
  })
})
