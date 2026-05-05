import { zodResolver } from '@hookform/resolvers/zod'
import { FileUp, Info, Lock, Zap, FileText, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import type { DocumentFormData, DocumentType } from '../types/onboarding.types'
import { mapIdentityTypeToDocumentType } from '../mappers/documentTypeMapper'

export type DocumentsStepProps = {
  defaultValues?: Partial<DocumentFormData>
  onBack: () => void
  onSubmit: (data: DocumentFormData) => Promise<void> | void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/png', 'image/jpeg'] as const
const PDF_FILE_TYPE = 'application/pdf'
const PROOF_OF_ADDRESS_ACCEPT = '.png,.jpeg,.jpg,.pdf,image/png,image/jpeg,application/pdf'

const localDocumentSchema = z.object({
  identityType: z.enum(['RG', 'CNH'], { error: 'Selecione o tipo de documento' }),
  cnhDigital: z.boolean(),
  frontFile: z
    .any()
    .refine((file) => file instanceof File, 'Este documento é obrigatório')
    .refine((file) => file && ALLOWED_FILE_TYPES.includes(file.type), 'Formato inválido. Envie PDF, PNG ou JPG')
    .refine((file) => file && file.size <= MAX_FILE_SIZE, 'O arquivo deve ter no máximo 10MB'),
  backFile: z.any().optional(),
  proofOfAddress: z
    .any()
    .refine((file) => file instanceof File, 'O comprovante de endereço é obrigatório')
    .refine((file) => file && ALLOWED_FILE_TYPES.includes(file.type), 'Formato inválido. Envie PDF, PNG ou JPG')
    .refine((file) => file && file.size <= MAX_FILE_SIZE, 'O arquivo deve ter no máximo 10MB'),
}).superRefine((data, ctx) => {
  const isCnhDigital = data.identityType === 'CNH' && data.cnhDigital
  if (!isCnhDigital) {
    if (!(data.backFile instanceof File)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'O verso do documento é obrigatório',
        path: ['backFile'],
      })
    } else {
      if (!ALLOWED_FILE_TYPES.includes(data.backFile.type as (typeof ALLOWED_FILE_TYPES)[number])) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Formato inválido. Envie PDF, PNG ou JPG',
          path: ['backFile'],
        })
      }
      if (data.backFile.size > MAX_FILE_SIZE) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'O arquivo deve ter no máximo 10MB',
          path: ['backFile'],
        })
      }
    }
  } else if (data.frontFile instanceof File && data.frontFile.type !== PDF_FILE_TYPE) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Para CNH Digital, envie um arquivo em PDF',
      path: ['frontFile'],
    })
  }
})

type LocalDocumentData = z.infer<typeof localDocumentSchema>

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  return `${Math.ceil(bytes / 1024)} KB`
}

function FileUploadArea({
  label,
  description,
  file,
  error,
  onChange,
  accept,
}: {
  label: string
  description: string
  file: File | null
  error?: string
  onChange: (file: File | null) => void
  accept?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onChange(e.target.files[0])
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-[17px] font-semibold text-[#0F172A]">{label}</h3>
      <div
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          error ? 'border-red-300 bg-red-50' : file ? 'border-[#003399] bg-blue-50/50' : 'border-slate-300 bg-white hover:bg-slate-50'
        }`}
      >
        <input
          type="file"
          accept={accept ?? '.pdf,.png,.jpg,.jpeg'}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={handleFileChange}
          ref={inputRef}
          title="Selecione o arquivo"
        />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#003399]/10 text-[#003399]">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{file.name}</p>
              <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
            </div>
            <button
              type="button"
              className="relative z-10 mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:underline"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onChange(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
            >
              <Trash2 className="h-4 w-4" />
              Remover arquivo
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <FileUp className="h-6 w-6" />
            </div>
            <p className="text-[15px] font-medium text-slate-900">Arraste ou clique para enviar</p>
            <p className="mt-1 text-[13px] text-slate-500">{description}</p>
            <div className="mt-5 pointer-events-none inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 bg-white shadow-sm">
              Selecionar arquivo
            </div>
          </>
        )}
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  )
}

export function DocumentsStep({ defaultValues, onBack, onSubmit }: DocumentsStepProps) {
  const identityFiles = defaultValues?.documents?.filter(
    (d) => d.documentType === 'IDENTITY_REGISTER' || d.documentType === 'DRIVER_LICENSE',
  ) ?? []
  const defaultFrontFile = identityFiles[0]?.file ?? null
  const defaultBackFile = identityFiles[1]?.file ?? null
  const defaultProofOfAddress = defaultValues?.documents?.find((d) => d.documentType === 'PROOF_OF_ADDRESS')?.file ?? null

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LocalDocumentData>({
    resolver: zodResolver(localDocumentSchema),
    defaultValues: {
      identityType: defaultValues?.identityType ?? 'RG',
      cnhDigital: defaultValues?.cnhDigital ?? false,
      frontFile: defaultFrontFile,
      backFile: defaultBackFile,
      proofOfAddress: defaultProofOfAddress,
    },
  })

  const identityType = watch('identityType')
  const cnhDigital = watch('cnhDigital')
  const isDigital = identityType === 'CNH' && cnhDigital

  const handleLocalSubmit = (data: LocalDocumentData) => {
    const identityDocumentType = mapIdentityTypeToDocumentType(data.identityType)
    const documents: { documentType: DocumentType; file: File }[] = [
      { documentType: identityDocumentType, file: data.frontFile as File },
    ]

    if (!(data.identityType === 'CNH' && data.cnhDigital) && data.backFile) {
      documents.push({ documentType: identityDocumentType, file: data.backFile as File })
    }

    if (data.proofOfAddress) {
      documents.push({ documentType: 'PROOF_OF_ADDRESS', file: data.proofOfAddress as File })
    }

    return onSubmit({ 
      documents,
      identityType: data.identityType,
      cnhDigital: data.cnhDigital,
    })
  }

  return (
    <div className="mx-auto w-full">
      <div className="mb-10 space-y-3">
        <h2 className="text-[26px] font-bold text-[#0F172A]">Envio de Documentos</h2>
        <p className="text-[15px] text-slate-600 leading-relaxed">
          Para garantir a segurança da sua conta, precisamos de uma foto nítida do seu documento de identidade (RG ou CNH) e de um comprovante de residência.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleLocalSubmit)} className="space-y-10" noValidate>
        
        {/* Document Type Selection */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="identityType"
            render={({ field }) => (
              <>
                <label
                  className={`relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors ${
                    field.value === 'RG' ? 'border-[#003399] bg-[#003399]/5' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[#003399]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h3m-6 0a3 3 0 003.95.343" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">RG</p>
                    <p className="text-[13px] text-slate-500">Registro Geral</p>
                  </div>
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 mt-1 ${field.value === 'RG' ? 'border-[#003399]' : 'border-slate-300'}`}>
                    {field.value === 'RG' && <div className="h-2.5 w-2.5 rounded-full bg-[#003399]" />}
                  </div>
                  <input
                    type="radio"
                    className="hidden"
                    value="RG"
                    checked={field.value === 'RG'}
                    onChange={() => {
                      field.onChange('RG')
                      setValue('cnhDigital', false)
                    }}
                  />
                </label>

                <label
                  className={`relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors ${
                    field.value === 'CNH' ? 'border-[#003399] bg-[#003399]/5' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">CNH</p>
                    <p className="text-[13px] text-slate-500">Carteira de Habilitação</p>
                  </div>
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 mt-1 ${field.value === 'CNH' ? 'border-[#003399]' : 'border-slate-300'}`}>
                    {field.value === 'CNH' && <div className="h-2.5 w-2.5 rounded-full bg-[#003399]" />}
                  </div>
                  <input
                    type="radio"
                    className="hidden"
                    value="CNH"
                    checked={field.value === 'CNH'}
                    onChange={() => field.onChange('CNH')}
                  />
                </label>
              </>
            )}
          />
        </div>

        {identityType === 'CNH' && (
          <div className="flex items-center justify-end">
            <label className="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="peer sr-only"
                {...register('cnhDigital')}
              />
              <div className="peer relative h-6 w-11 rounded-full bg-slate-200 transition-colors after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#003399] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#003399] peer-focus:ring-offset-2"></div>
              <span className="text-sm font-medium text-slate-700">Minha CNH é digital</span>
            </label>
          </div>
        )}

        <div className="space-y-8">
          <Controller
            control={control}
            name="frontFile"
            render={({ field }) => (
              <FileUploadArea
                label={isDigital ? 'CNH Digital' : 'Frente do documento'}
                description={isDigital ? "Formatos aceitos: PDF (Máx. 10MB)" : "Formatos aceitos: JPG, PNG ou PDF (Máx. 10MB)"}
                file={field.value}
                error={errors.frontFile?.message as string | undefined}
                onChange={field.onChange}
                accept={isDigital ? '.pdf,application/pdf' : undefined}
              />
            )}
          />

          {!isDigital && (
            <Controller
              control={control}
              name="backFile"
              render={({ field }) => (
                <FileUploadArea
                  label="Verso do documento"
                  description="Certifique-se de que o verso esteja legível"
                  file={field.value}
                  error={errors.backFile?.message as string | undefined}
                  onChange={field.onChange}
                />
              )}
            />
          )}

          <hr className="border-slate-200" />

          <Controller
            control={control}
            name="proofOfAddress"
            render={({ field }) => (
              <FileUploadArea
                label="Comprovante de residência"
                description="Formatos aceitos: JPG, PNG ou PDF (Máx. 10MB)"
                file={field.value}
                error={errors.proofOfAddress?.message as string | undefined}
                onChange={field.onChange}
                accept={PROOF_OF_ADDRESS_ACCEPT}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-xl bg-[#F0F7FF] p-5 sm:flex-row sm:items-start sm:gap-4">
          <Info className="h-5 w-5 shrink-0 text-[#003399] mt-0.5" />
          <div className="space-y-2">
            <p className="font-semibold text-[#003399]">Dicas para uma validação rápida:</p>
            <ul className="list-inside list-disc space-y-1.5 text-[14px] text-[#003399]/80 ml-2">
              <li>Remova o documento do plástico protetor.</li>
              <li>Evite reflexos de luz direta sobre o documento.</li>
              <li>Mantenha o documento em uma superfície plana e escura.</li>
              <li>Para comprovantes, certifique-se de que a data de emissão não ultrapassa 90 dias.</li>
            </ul>
          </div>
        </div>

        <div className="pt-2 pb-6">
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex w-full sm:w-[140px] items-center justify-center rounded-md border border-[#003399] px-4 py-3.5 text-[15px] font-semibold text-[#003399] transition hover:bg-blue-50"
            >
              Voltar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full sm:w-[180px] items-center justify-center rounded-md bg-[#003399] px-4 py-3.5 text-[15px] font-semibold text-white transition hover:bg-[#002266] disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSubmitting ? 'Continuando...' : 'Continuar'}
            </button>
          </div>
        </div>
      </form>
      
      <div className="mt-4 flex flex-col gap-4 sm:flex-row pb-8">
        <div className="flex flex-1 items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Privacidade</p>
            <p className="text-[14px] font-bold text-slate-900">Seus dados estão criptografados</p>
          </div>
        </div>

        <div className="flex flex-1 items-center gap-4 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
            <Zap className="h-5 w-5 fill-amber-500" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tempo Médio</p>
            <p className="text-[14px] font-bold text-slate-900">Validação em até 2 minutos</p>
          </div>
        </div>
      </div>

    </div>
  )
}
