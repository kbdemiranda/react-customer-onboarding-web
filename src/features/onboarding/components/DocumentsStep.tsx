import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'

import { documentItemSchema, documentSchema } from '../schemas/documentSchema'
import type { DocumentFormData, DocumentType } from '../types/onboarding.types'

export type DocumentsStepProps = {
  defaultValues?: Partial<DocumentFormData>
  onBack: () => void
  onSubmit: (data: DocumentFormData) => Promise<void> | void
}

const documentTypeLabels: Record<DocumentType, string> = {
  IDENTITY: 'Documento de identificação',
  PROOF_OF_ADDRESS: 'Comprovante de endereço',
  INCOME_PROOF: 'Comprovante de renda',
}

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return `${Math.ceil(bytes / 1024)} KB`
}

export function DocumentsStep({ defaultValues, onBack, onSubmit }: DocumentsStepProps) {
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      documents: defaultValues?.documents ?? [],
    },
  })

  const {
    fields: documentFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'documents',
  })

  const [selectedDocumentType, setSelectedDocumentType] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedFileName, setSelectedFileName] = useState('')
  const [documentTypeError, setDocumentTypeError] = useState('')
  const [fileError, setFileError] = useState('')

  const handleAddDocument = () => {
    setDocumentTypeError('')
    setFileError('')

    const result = documentItemSchema.safeParse({
      documentType: selectedDocumentType,
      file: selectedFile,
    })

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === 'documentType') {
          setDocumentTypeError(issue.message)
        }

        if (issue.path[0] === 'file') {
          setFileError(issue.message)
        }
      })

      return
    }

    append(result.data)
    setSelectedDocumentType('')
    setSelectedFile(null)
    setSelectedFileName('')
    clearErrors('documents')
  }

  const handleFileChange = (fileList: FileList | null) => {
    const file = fileList?.[0] ?? null
    setSelectedFile(file)
    setSelectedFileName(file?.name ?? '')
    setFileError('')
  }

  const handleRemoveDocument = (index: number) => {
    remove(index)

    if (documentFields.length <= 1) {
      setError('documents', { type: 'manual', message: 'Adicione pelo menos um documento' })
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Documentos</h1>
        <p className="mt-2 text-sm text-slate-600">Envie os documentos necessários para concluir sua abertura de conta.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Adicionar documento</h2>
          <p className="mt-1 text-sm text-slate-600">Formatos aceitos: PDF, PNG, JPG. Tamanho máximo: 5MB.</p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="documentType" className="block text-sm font-medium text-slate-700">
                Tipo de documento
              </label>
              <select
                id="documentType"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                value={selectedDocumentType}
                onChange={(event) => {
                  setSelectedDocumentType(event.target.value)
                  setDocumentTypeError('')
                }}
              >
                <option value="">Selecione um tipo</option>
                {Object.entries(documentTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {documentTypeError ? <p className="text-sm text-red-600">{documentTypeError}</p> : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="documentFile" className="block text-sm font-medium text-slate-700">
                Arquivo
              </label>
              <input
                id="documentFile"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                onChange={(event) => handleFileChange(event.target.files)}
              />
              {fileError ? <p className="text-sm text-red-600">{fileError}</p> : null}
            </div>
          </div>

          {selectedFile ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <p className="font-medium text-slate-900">Arquivo selecionado</p>
              <p className="mt-1">{selectedFileName}</p>
              <p>{formatFileSize(selectedFile.size)}</p>
            </div>
          ) : null}

          <div className="mt-4">
            <button
              type="button"
              onClick={handleAddDocument}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Adicionar documento
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Documentos adicionados</h2>

          {documentFields.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600">Nenhum documento adicionado.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {documentFields.map((field, index) => (
                <div key={field.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{documentTypeLabels[field.documentType]}</p>
                    <p className="mt-1 text-sm text-slate-700">{field.file.name}</p>
                    <p className="text-xs text-slate-600">{formatFileSize(field.file.size)}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(index)}
                    className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
          )}

          {errors.documents?.message ? <p className="mt-3 text-sm text-red-600">{errors.documents.message}</p> : null}
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            Voltar
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 sm:w-auto"
          >
            {isSubmitting ? 'Continuando...' : 'Continuar'}
          </button>
        </div>
      </form>
    </div>
  )
}
